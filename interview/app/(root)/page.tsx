import React from 'react'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/general.action';

const page = async () => {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">

          <h2>
            Get Interview Ready with AI Powered Practice & Feedback
          </h2>

          <p className="text-lg">
            Practice on real interview questions and get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">
              Start an Interview
            </Link>
          </Button>

        </div>

        <Image src="/robot.png"
          width={400}
          height={400}
          className="max-sm:hidden"
          alt="robot">
        </Image>

      </section>
    </>
  )
}

export default page