# Madiun Smart Guide

A modern chatbot application built with Next.js 14, Tailwind CSS, and Lucide React to help tourists explore Madiun city with AI assistance.

## Features

- 🤖 **AI Chat Interface**: WhatsApp/Telegram-style chat interface with real-time messaging
- 📱 **Mobile-First Design**: Optimized for smartphone usage by tourists
- 📍 **Popular Places**: Quick access to popular destinations in Madiun
- 💬 **Conversation History**: Track and manage previous conversations
- 🎨 **Modern UI**: Clean, elegant design with smooth animations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Language**: TypeScript
- **Responsive**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main page component
├── components/
│   ├── Header.tsx       # Application header with navigation
│   ├── Sidebar.tsx      # Sidebar with history and popular places
│   └── ChatInterface.tsx # Main chat interface
```

## Key Features

### Header
- Responsive navigation with mobile menu
- Brand logo and project title
- Quick access to main features

### Sidebar
- **Popular Places**: Pahlawan Street Center, Monumen Kresek, Alun-Alun, Taman Rekreasi Wilis
- **Conversation History**: Previous chats with timestamps
- Collapsible sections with smooth animations

### Chat Interface
- WhatsApp/Telegram-style message bubbles
- Real-time typing indicators
- Message input with character limit
- Quick action buttons for common queries
- Attachment and voice input buttons
- Auto-scroll to latest messages

## API Integration

The application is designed to integrate with your Antigravity API for chatbot functionality. The chat interface includes placeholder functions that can be easily connected to your existing API endpoints.

## Responsive Design

- **Mobile**: Full-width chat interface with collapsible sidebar
- **Tablet**: Optimized layout with adjusted sidebar width
- **Desktop**: Full three-column layout with persistent sidebar

## Customization

### Colors
The theme uses a custom color palette defined in `tailwind.config.js`:
- Primary: Blue color scheme for main actions
- WhatsApp: Custom colors for chat bubble styling

### Animations
Custom animations defined in the Tailwind config:
- `fade-in`: Smooth fade-in effect
- `slide-up`: Slide-up animation for dropdowns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
