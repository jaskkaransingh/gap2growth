from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import urllib.parse
import os
import time

app = FastAPI(
    title="LinkedIn Job Scraper API",
    description="Microservice to scrape unauthenticated LinkedIn job postings based on skills.",
    version="1.0.0"
)

# Allow frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    link: str
    date: str
    match_score: Optional[int] = None

class JobSearchRequest(BaseModel):
    keywords: str
    location: str = "Worldwide"

@app.get("/")
def read_root():
    return {"status": "ok", "service": "job_scraper"}

@app.post("/jobs/search", response_model=List[Job])
def search_jobs(request: JobSearchRequest):
    """
    Scrapes LinkedIn public job search for the given keywords.
    """
    try:
        # Map frontend locations to LinkedIn geoIds for strict regional filtering
        location_map = {
            "worldwide": "92000000",
            "united states": "103644278",
            "europe": "91000000",
            "asia": "91000002",
        }
        
        loc_lower = request.location.lower()
        geo_id = location_map.get(loc_lower, "92000000") # Default to worldwide
        
        # If "remote" is selected, use worldwide geoId but add LinkedIn's Remote filter parameter (f_WT=2)
        f_wt_param = "&f_WT=2" if loc_lower == "remote" else ""
        
        encoded_keywords = urllib.parse.quote(request.keywords)
        
        url = f"https://www.linkedin.com/jobs/search?keywords={encoded_keywords}&geoId={geo_id}{f_wt_param}&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0"
        
        # Spoof a real browser to avoid instant bot blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        }

        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"LinkedIn returned status code: {response.status_code}")
            raise HTTPException(status_code=502, detail="Failed to fetch jobs from LinkedIn")

        soup = BeautifulSoup(response.text, "html.parser")
        
        jobs = []
        # Find all job cards in the public SERP
        job_cards = soup.find_all("div", class_="base-card relative w-full hover:no-underline focus:no-underline base-card--link base-search-card base-search-card--link job-search-card")

        # Fallback if structure changes
        if not job_cards:
            job_cards = soup.find_all("li", class_="")
            job_cards = [c for c in job_cards if c.find("div", class_="base-search-card")]

        # Determine limit based on location
        limit = 25 if request.location.lower() == "worldwide" else 10

        for card in job_cards[:limit]: # Adjust limit based on region
            try:
                # Title
                title_elem = card.find("h3", class_="base-search-card__title")
                title = title_elem.text.strip() if title_elem else "Unknown Title"
                
                # Company
                company_elem = card.find("h4", class_="base-search-card__subtitle")
                company = company_elem.text.strip() if company_elem else "Unknown Company"
                
                # Location
                location_elem = card.find("span", class_="job-search-card__location")
                location = location_elem.text.strip() if location_elem else "Unknown Location"
                
                # Link
                link_elem = card.find("a", class_="base-card__full-link")
                link = link_elem["href"] if link_elem and "href" in link_elem.attrs else ""
                
                # Date
                date_elem = card.find("time", class_="job-search-card__listdate") or card.find("time", class_="job-search-card__listdate--new")
                date = date_elem.text.strip() if date_elem else "Recently"
                
                # We extract the job ID from the link roughly if possible to act as a unique react key
                job_id = link.split("view/")[-1].split("?")[0] if "view/" in link else str(hash(title + company))
                
                # Derive a pseudo match score based on keyword presence in title (simple heuristic)
                score = 70
                title_lower = title.lower()
                query_words = request.keywords.lower().split()
                matches = sum(1 for w in query_words if w in title_lower)
                if matches > 0:
                    score += int((matches / len(query_words)) * 25) # Up to 95
                
                jobs.append({
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "location": location,
                    "link": link,
                    "date": date,
                    "match_score": min(score, 99) # Cap at 99%
                })
            except Exception as e:
                print(f"Error parsing a job card: {e}")
                continue

        return jobs
        
    except requests.RequestException as e:
        print(f"Network error: {e}")
        raise HTTPException(status_code=503, detail="Network error while scraping jobs")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error parsing jobs")

if __name__ == "__main__":
    import uvicorn
    # Make sure this runs on a DIFFERENT port than the roadmap API (8000) and Node API (5000)
    uvicorn.run(app, host="127.0.0.1", port=8001)
