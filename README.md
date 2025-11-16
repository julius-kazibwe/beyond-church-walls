# Beyond Church Walls - Book Launch Website

A modern, responsive one-page website for the upcoming book "Beyond Church Walls" by Rev. John William Kasirye. The site introduces the book, showcases the author, displays endorsements, and collects email signups and pre-order interest before the mid-December launch.

## Features

- **Hero Section**: Eye-catching introduction with countdown timer to mid-December release
- **About the Book**: Description of the book's purpose, themes, and impact
- **About the Author**: Author bio highlighting Rev. John William Kasirye's background as an ordained minister, teacher, and professional with 27 years at CalPERS
- **Endorsements**: Rotating testimonials from key leaders with card layout
- **Join the Mission**: Email signup form for launch notifications
- **Pre-Order Interest Form**: Comprehensive form for endorsements, pre-orders, copy requests, and feedback
- **Contact/Footer**: Contact information, social media links, and mission statement

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Design**: White, gold (#D4AF37), and navy blue (#1a237e) color palette

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd beyond-church-walls
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up the backend (see [Backend Setup Guide](./BACKEND_SETUP.md)):
```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your email configuration
cd ..
```

4. Create frontend `.env` file:
```bash
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:3001/api)
```

5. Start the backend server (in a separate terminal):
```bash
cd server
npm start
# or for development: npm run dev
```

6. Start the frontend development server:
```bash
npm run dev
```

7. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Project Structure

```
beyond-church-walls/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx      # Fixed navigation bar
│   │   ├── Hero.jsx            # Hero section with countdown
│   │   ├── CountdownTimer.jsx  # Countdown timer component
│   │   ├── AboutBook.jsx       # About the book section
│   │   ├── AboutAuthor.jsx     # About the author section
│   │   ├── Endorsements.jsx    # Testimonials section
│   │   ├── JoinMission.jsx     # Email signup form
│   │   ├── PreOrderForm.jsx    # Pre-order interest form
│   │   └── Footer.jsx          # Footer with contact info
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles with TailwindCSS
├── public/                     # Static assets
├── index.html                  # HTML template
├── tailwind.config.js          # TailwindCSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies and scripts
```

## Customization

### Updating Content

- **Book Title**: Update in `src/components/Hero.jsx`
- **Author Bio**: Edit `src/components/AboutAuthor.jsx`
- **Book Description**: Modify `src/components/AboutBook.jsx`
- **Endorsements**: Update the `endorsements` array in `src/components/Endorsements.jsx`
- **Contact Information**: Edit `src/components/Footer.jsx`

### Countdown Timer

The countdown timer targets **December 15, 2024** by default. To change the launch date, update the target date in `src/components/CountdownTimer.jsx`:

```javascript
const targetDate = new Date('2024-12-15T00:00:00').getTime();
```

### Backend Integration

The backend is already integrated! All forms are connected to the API endpoints.

**Backend Setup:**
- See [Backend Setup Guide](./BACKEND_SETUP.md) for detailed instructions
- Backend server is in the `server/` directory
- API endpoints handle all form submissions and send email notifications

**API Endpoints:**
- `/api/email-signup` - Email signup form
- `/api/pre-order` - Pre-order/interest form
- `/api/book-preview-access` - Book preview access

**Configuration:**
- Backend: Configure `server/.env` with your email service
- Frontend: Configure `.env` with your API URL (`VITE_API_URL`)

### Author Photo

The author photo is already configured in `src/components/AboutAuthor.jsx` to use `/author.jpeg` from the `public` folder. To update it, simply replace the image file in the `public` directory.

### Social Media Links

Update the social media links in `src/components/Footer.jsx` with your actual profile URLs.

## Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build the project: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

### Other Platforms

The `dist` folder contains static files that can be deployed to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Any web server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Notes

- All forms are connected to the backend API and will send email notifications.
- The backend must be running and configured with email credentials for forms to work.
- All proceeds from the book go toward funding clean water projects in Uganda (as stated in the footer).
- The site is fully responsive and works on mobile, tablet, and desktop devices.

## Support

For questions or customization needs, please contact the development team.
