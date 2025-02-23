# coinswiper 🪙

coinswiper is a modern web application built with Next.js for voting on your Solana tokens. It provides real-time data and insights using the DexScreener API integration.

## 🚀 Features

- Real-time cryptocurrency token tracking
- Integration with DexScreener for market data
- Modern, responsive UI built with Tailwind CSS and Shadcn UI
- Type-safe development with TypeScript
- Database integration with Prisma

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- npm, pnpm or yarn package manager
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/kzndotsh/coinswiper.git
cd coinswiper
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your configuration values.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

### Production Build
```bash
npm run build
npm start
# or
pnpm run build
pnpm start
# or
yarn build
yarn start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **API Integration**: [DexScreener SDK](https://docs.dexscreener.com/)
- **UI Components**: Shadcn UI components with Lucide React icons

## 📁 Project Structure

```
coinswiper/
├── app/           # Next.js app directory
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── prisma/        # Database schema and migrations
├── public/        # Static assets
└── types/         # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [DexScreener](https://dexscreener.com/) for the cryptocurrency data API
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework 