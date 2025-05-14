# CS732 project - Team WeDev

Welcome to the CS732 project. We look forward to seeing the amazing things you create this semester! This is your team's repository.

Your team members are:
- Cheng Li _(cli807@aucklanduni.ac.nz)_
- Yunfei Xu _(yxu378@aucklanduni.ac.nz)_
- Wenzhe Pang _(wpan273@aucklanduni.ac.nz)_
- Ashutosh Singh _(nisa367@aucklanduni.ac.nz)_
- Zoe Zhong _(pzho670@aucklanduni.ac.nz)_
- Yi Ji _(yji850@aucklanduni.ac.nz)_
- Meize Zhou _(mzho097@aucklanduni.ac.nz)_

You have complete control over how you run this repo. All your members will have admin access. The only thing setup by default is branch protections on `main`, requiring a PR with at least one code reviewer to modify `main` rather than direct pushes.

Please use good version control practices, such as feature branching, both to make it easier for markers to see your group's history and to lower the chances of you tripping over each other during development

![](./WeDev.png)


#  Urban Ease – Home Service Web Application

# About Urban Ease
Urban Ease is a full-stack web application that connects urban residents with professional service providers for household needs such as cleaning, gardening, plumbing, painting, and House Repair. Our platform offers a convenient and synchronized booking system designed with urban users' busy lifestyles in mind.

---

# Key Differentiators
1. Unified multi-service booking
2. Real-time progress tracking
3. Multiple service provider
4. Real time Chat

---

# Features
- User login
- Role-based login system
- Interactive homepage with filtering
- Service booking & provider matching (with maps)
- Review and rating system
- Profile and order history

# Other services
- Availability-based scheduling
- Admin dashboard
- Payment integration (Stripe/PayPal placeholder)

---

# Testing
- Manual Testing: Conducted on key flows such as login, booking, provider matching, and feedback submission.
- Unit Tests (Partial): Basic backend route tests with Jest.
- Tools Used: Postman (API testing), Chrome DevTools (UI testing)

---

# Design Thinking & UX
We followed a design thinking approach:
- Empathize & Define**: Interviewed users to identify pain points with existing services
- Ideate: Brainstormed solutions and mapped journeys
- Prototype: Created low- and high-fidelity mockups (available in `/design`)
- Test: Conducted peer reviews and sprint feedback cycles
-  Used canva for Logo and bob desgine
UI Libraries Used: Chakra UI + custom CSS

---

# Beyond Course Learning
We explored:
- AWS Cognito: Although we attempted to integrate AWS Cognito for secure user authentication, due to configuration complexity and time limitations, we were unable to successfully complete the full integration. We instead used a custom authentication flow to support user login and registration.(Ps. We have copleted but due to time and different structure we are not able tpo implement )
- AWS S3: we stored our images used for application in s3 bucket
- Google Maps API: For real-time provider selection


---

# Code Quality & Best Practices
- React Hooks + Component-based architecture
- Modular backend structure (MVC)
- Secure credential management via `.env`
- Peer-reviewed pull requests on GitHub
- ESLint + Prettier configuration

---

# Project Management
- Agile workflow (4 Sprints)
- Weekly meetings (Google Meet)
- Daily task tracking (Notion)
- Communication (WhatsApp + GitHub Issues)

---

# Git Workflow
- Feature branching + Development/Main branches
- Regular commits with clear messages
- Peer code review required before merge

---

# Deployment

- Frontend
- Backend
- Database
- Media: AWS S3

---

# Risks and Mitigation
| Risk | Solution |
|------|----------|
| Time Constraints | Buffer time in schedule, daily tracking |
| Changing Requirements | Early market research, modular architecture |
| Communication Gaps | Weekly syncs, shared documentation |
| Technical Bottlenecks | Feasibility checks, peer reviews |

---

# Future Improvements
- AI  Real-time chat
- Provider background verification
- Full AWS Cognito integration
- Mobile app integration
- Admin analytics dashboard
- AI tool implemetaion
- Adding other services
---

## How to Run Locally

# Clone project
git clone
# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd backend
npm install
npm run start


---

# Meeting Minutes
We held weekly meetings(Along with that we also scheduled meeting some times individaly for working on same branch)to track progress, resolve issues, and assign tasks. Documentation includes:
Wiki link
https://github.com/UOA-CS732-S1-2025/group-project-wedev.wiki.git

