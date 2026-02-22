from manim import *
import json
import numpy as np

class CareerWrappedScene(Scene):
    def construct(self):
        # ---------- LOAD DATA ----------
        try:
            with open("payload.json") as f:
                data = json.load(f)
        except Exception:
            data = {
                "user_name": "Developer",
                "skills_before": {"Python": 3, "React": 2, "SQL": 4},
                "skills_after": {"Python": 8, "React": 7, "SQL": 9},
                "achievements": ["Built AWS Pipeline", "Lead Dev for Hackathon"],
                "certification_title": "Full Stack Mastery"
            }

        user_name = data["user_name"]
        skills_before = data["skills_before"]
        skills_after = data["skills_after"]
        achievements = data["achievements"]
        cert_title = data["certification_title"]

        # Theme Config
        self.camera.background_color = "#000000"
        MAIN_COLOR = WHITE
        ACCENT_COLOR = GRAY

        # ---------- SCENE 1: TITLE ----------
        title_text = Text(f"Career Wrapped: {user_name}", font_size=40)
        title_text.set_color_by_gradient(WHITE, GRAY)
        
        self.play(Write(title_text), run_time=1.5)
        self.wait(1)
        self.play(FadeOut(title_text))

        # ---------- SCENE 2: RADAR GRAPH ----------
        skills = list(skills_before.keys())
        num_skills = len(skills)
        angles = np.linspace(0, 2 * np.pi, num_skills, endpoint=False)
        
        # Radar Base
        base_circles = VGroup(*[
            RegularPolygon(n=num_skills, radius=r, color=GRAY_D, stroke_opacity=0.3)
            for r in np.arange(0.5, 3.5, 0.5)
        ])
        axes = VGroup(*[
            Line(ORIGIN, 3 * np.array([np.cos(a), np.sin(a), 0]), color=GRAY_D, stroke_opacity=0.3)
            for a in angles
        ])
        
        skill_labels = VGroup(*[
            Text(s, font_size=20, color=WHITE).move_to(3.5 * np.array([np.cos(a), np.sin(a), 0]))
            for s, a in zip(skills, angles)
        ])

        self.play(Create(base_circles), Create(axes), Write(skill_labels))

        # Radar Polygon - Before
        points_before = [
            (skills_before[s] / 10.0) * 3 * np.array([np.cos(a), np.sin(a), 0])
            for s, a in zip(skills, angles)
        ]
        poly_before = Polygon(*points_before, color=GRAY, fill_opacity=0.4, stroke_width=2)
        
        # Radar Polygon - After
        points_after = [
            (skills_after[s] / 10.0) * 3 * np.array([np.cos(a), np.sin(a), 0])
            for s, a in zip(skills, angles)
        ]
        poly_after = Polygon(*points_after, color=WHITE, fill_opacity=0.2, stroke_width=4)

        self.play(Create(poly_before))
        self.wait(0.5)
        self.play(Transform(poly_before, poly_after), run_time=2, rate_func=slow_into)
        self.wait(1)
        self.play(FadeOut(base_circles, axes, skill_labels, poly_before))

        # ---------- SCENE 3: SKILL COUNTERS ----------
        counters_group = VGroup()
        for i, (skill, val_after) in enumerate(skills_after.items()):
            label = Text(f"{skill}: ", font_size=32).to_edge(LEFT, buff=2).shift(UP * (1.5 - i * 0.8))
            val_tracker = ValueTracker(skills_before.get(skill, 0))
            counter_num = DecimalNumber(val_tracker.get_value(), num_decimal_places=0).next_to(label, RIGHT)
            counter_num.add_updater(lambda d, v=val_tracker: d.set_value(v.get_value()))
            
            self.play(Write(label), FadeIn(counter_num))
            self.play(val_tracker.animate.set_value(val_after), run_time=1)
            counters_group.add(label, counter_num)

        self.wait(1)
        self.play(FadeOut(counters_group))

        # ---------- SCENE 4: ACHIEVEMENTS ----------
        ach_title = Text("Key Achievements", font_size=40, color=WHITE).to_edge(UP, buff=1)
        self.play(Write(ach_title))
        
        ach_vgroup = VGroup()
        for ach in achievements:
            card_text = Text(ach, font_size=28, color=WHITE)
            rect = SurroundingRectangle(card_text, color=GRAY, buff=0.4, stroke_width=1)
            ach_vgroup.add(VGroup(rect, card_text))
        
        ach_vgroup.arrange(DOWN, buff=0.5)
        self.play(LaggedStart(*[FadeIn(item, shift=UP) for item in ach_vgroup], lag_ratio=0.5))
        self.wait(2)
        self.play(FadeOut(ach_title, ach_vgroup))

        # ---------- SCENE 5: CERTIFICATION ----------
        cert_card = RoundedRectangle(corner_radius=0.2, height=4, width=7, color=WHITE, stroke_width=2)
        cert_text = Text("CERTIFIED", font_size=20, color=GRAY).shift(UP * 1.3)
        cert_main = Text(cert_title, font_size=44, color=WHITE).shift(UP * 0.2)
        user_display = Text(f"Issued to {user_name}", font_size=24, color=GRAY).shift(DOWN * 1)
        
        cert_group = VGroup(cert_card, cert_text, cert_main, user_display)
        self.play(Create(cert_card), run_time=1.5)
        self.play(Write(cert_text), Write(cert_main), Write(user_display))
        self.wait(3)




class Gap2GrowthScene(Scene):
    def construct(self):
        # ---------- LOAD DATA ----------
        try:
            with open("payload.json") as f:
                data = json.load(f)
        except Exception:
            data = {
                "user_name": "User",
                "atsScore": 85,
                "existingSkills": ["React", "Python"],
                "suggestedSkills": ["Docker", "FastAPI"],
                "roadmap": ["Step 1: Containerize App", "Step 2: Build REST API"]
            }

        user_name = data.get("user_name", "User")
        ats_after = data.get("atsScore", 0)
        ats_before = max(0, int(ats_after) - 25)
        existing = data.get("existingSkills", [])
        suggested = data.get("suggestedSkills", [])
        roadmap = data.get("roadmap", [])

        # Theme Config
        self.camera.background_color = BLACK
        ACCENT = "#58a6ff"
        GREEN = "#3fb950"
        GRAY_TEXT = "#8b949e"

        # ---------- SCENE 1: TRANSFORMATION TITLE ----------
        title = Text("CAREER EVOLUTION", font_size=40, color=ACCENT)
        user_display = Text(f"{user_name.upper()}", font_size=54, weight=BOLD).next_to(title, DOWN, buff=0.5)
        
        self.play(FadeIn(title, shift=UP))
        self.play(Write(user_display))
        self.wait(2)
        self.play(FadeOut(title, user_display))

        # ---------- SCENE 2: CURRENT STATE (BEFORE) ----------
        header_before = Text("CURRENT STATE", font_size=32, color=GRAY_TEXT).to_edge(UP, buff=1)
        
        skill_group_before = VGroup(*[
            Text(f"- {s}", font_size=28) for s in existing[:5]
        ]).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to(LEFT * 3)

        score_box_before = VGroup(
            Text("ATS SCORE", font_size=24, color=GRAY_TEXT),
            DecimalNumber(ats_before, num_decimal_places=0, font_size=72)
        ).arrange(DOWN, buff=0.4).move_to(RIGHT * 3)

        self.play(Write(header_before))
        self.play(FadeIn(skill_group_before, shift=RIGHT))
        self.play(FadeIn(score_box_before, shift=LEFT))
        self.wait(2)

        # ---------- SCENE 3: THE TRANSFORMATION ----------
        header_transform = Text("OPTIMIZING PROFILE...", font_size=32, color=ACCENT).to_edge(UP, buff=1)
        
        # Suggested skills one by one
        skill_group_suggested = VGroup(*[
            Text(f"+ {s}", font_size=28, color=GREEN) for s in suggested[:3]
        ]).arrange(DOWN, buff=0.3, aligned_edge=LEFT).next_to(skill_group_before, DOWN, buff=0.5, aligned_edge=LEFT)

        self.play(Transform(header_before, header_transform))
        for item in skill_group_suggested:
            self.play(FadeIn(item, shift=UP), run_time=0.7)
        
        # ATS Score Rises
        score_num = score_box_before[1]
        ats_tracker = ValueTracker(ats_before)
        score_num.add_updater(lambda d: d.set_value(ats_tracker.get_value()))
        score_num.set_color(GREEN)
        
        self.play(
            ats_tracker.animate.set_value(ats_after),
            run_time=2,
            rate_func=slow_into
        )
        self.wait(1.5)

        # Transition Clear
        self.play(FadeOut(header_before, skill_group_before, skill_group_suggested, score_box_before))

        # ---------- SCENE 4: FINAL ROADMAP ----------
        roadmap_group = VGroup()
        for i, step in enumerate(roadmap[:3]):
            step_box = RoundedRectangle(corner_radius=0.1, height=1, width=8, color=ACCENT)
            step_text = Text(f"{step}", font_size=24).move_to(step_box)
            roadmap_group.add(VGroup(step_box, step_text))
        
        roadmap_group.arrange(DOWN, buff=0.4).shift(DOWN * 0.5)

        for item in roadmap_group:
            self.play(FadeIn(item, shift=UP))
            self.wait(0.5)

        self.wait(3)
        self.play(FadeOut(roadmap_group))

        # ---------- SCENE 5: CLOSING ----------
        cta = Text("LEVEL UP COMPLETE", font_size=48, weight=BOLD, color=GREEN)
        self.play(Write(cta))
        self.wait(2)
        self.play(FadeOut(cta))
