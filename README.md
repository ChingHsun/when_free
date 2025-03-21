# When Free

A modern scheduling application that makes it easy to find the best meeting times across multiple participants.

## Features

- **Flexible Scheduling** - Choose multiple dates that work for you
- **Time Slot Selection** - Simple drag-and-drop interface to select available time slots
- **Timezone Support** - Times automatically convert to each participant's local timezone
- **Group Overview** - See when everyone is available with an intuitive heatmap
- **Easy Sharing** - Share a simple link with all participants
- **Real-time Updates** - See availability updates as participants respond

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **UI Components**: Custom components based on shadcn/ui
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Date/Time Handling**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Website

when-free.vercel.app

## How It Works

1. **Create a Meeting**
   - Enter your name and meeting details
   - Select dates for your meeting
   
2. **Share the Link**
   - Copy the generated meeting link
   - Share with participants

3. **Participant Sign-up**
   - Participants enter their name and join the meeting
   - They select time slots using the intuitive grid interface

4. **View Results**
   - Check the results page to see overlapping availability
   - The system highlights the best meeting times

## Project Structure

```
when_free/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout component
│   │   ├── page.tsx      # Landing page
│   │   └── meetings/     # Meeting routes
│   ├── components/       # React components
│   │   ├── ui/           # UI components
│   │   └── ...           # Feature components
│   ├── lib/              # Utility functions and types
│   │   ├── constants.ts  # Constants
│   │   ├── firebase.ts   # Firebase setup
│   │   ├── meetingService.ts # Meeting-related services
│   │   ├── types.ts      # TypeScript type definitions
│   │   └── utils.ts      # Helper functions
│   └── store/            # Zustand store
└── ...
```

## Development Process

This project was developed in just 48 hours as a rapid prototype, leveraging Claude AI for collaborative development. The development approach followed these principles:

1. **Rapid Prototyping**: Focus on core functionality first, with a clean, minimal design
2. **AI-Assisted Development**: Used Claude AI to help with code generation, debugging, and architectural decisions
3. **User-First Design**: Prioritized intuitive interfaces and smooth user experience
4. **Modern Stack**: Chose cutting-edge technologies (Next.js 15, React 19) for future-proofing
5. **Serverless Architecture**: Utilized Firebase for backend to eliminate server management overhead
6. **Iterative Development**: Built features incrementally, testing each component before moving on

The entire application went from concept to functional product in a weekend, demonstrating how AI-assisted development can dramatically accelerate the software development process while maintaining high quality.

## Future Improvements

- Edit meeting
- Network Security
- Backend developing

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [date-fns](https://date-fns.org/)
- [Lucide](https://lucide.dev/)