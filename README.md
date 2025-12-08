# Nodebase - Workflow Automation Platform

A modern, visual workflow automation platform built with Next.js, React Flow, and Inngest. Create, manage, and execute complex workflows with an intuitive drag-and-drop interface.

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
- **Real-time Execution**: Background job processing with Inngest
- **HTTP Request Nodes**: Make API calls with configurable methods and parameters
- **Manual Triggers**: Execute workflows on-demand with manual trigger nodes
- **Variable System**: Pass data between nodes using template variables
- **Authentication**: Secure user authentication and workspace isolation
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Workflow Engine**: React Flow for visual editing
- **Background Jobs**: Inngest for reliable workflow execution
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js
- **API**: tRPC for type-safe APIs
- **State Management**: Jotai for atomic state management

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nodebase.git
   cd nodebase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/nodebase"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   INNGEST_EVENT_KEY="your-inngest-event-key"
   INNGEST_SIGNING_KEY="your-inngest-signing-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start Inngest Dev Server** (in a separate terminal)
   ```bash
   npx inngest-cli@latest dev
   ```

## 🎯 Usage

### Creating a Workflow

1. Navigate to the Workflows page
2. Click "Create Workflow" to start a new workflow
3. Use the visual editor to add nodes:
   - **Manual Trigger**: Start workflows manually
   - **HTTP Request**: Make API calls to external services

### Configuring Nodes

**Manual Trigger Node:**
- Automatically added to new workflows
- Click to configure trigger settings
- Enables the "Execute Workflow" button

**HTTP Request Node:**
- Configure endpoint URL
- Select HTTP method (GET, POST, PUT, DELETE, PATCH)
- Add request body for POST/PUT/PATCH requests
- Set variable name for referencing response data

### Using Variables

Reference data from previous nodes using template syntax:
- `{{variableName.httpResponse.data}}` - Access response data
- `{{variableName.httpResponse.status}}` - Access HTTP status
- `{{json variableName}}` - Stringify objects

### Executing Workflows

1. Ensure your workflow has a Manual Trigger node
2. Click the "Execute Workflow" button that appears at the bottom
3. Monitor execution progress in the Inngest dashboard
4. View results and debug any issues

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
├── config/                 # Configuration files
├── features/               # Feature-based modules
│   ├── editer/            # Workflow editor components
│   ├── executions/        # Node execution logic
│   ├── triggers/          # Trigger node components
│   └── workflows/         # Workflow management
├── inngest/               # Background job functions
├── lib/                   # Utility libraries
└── trpc/                  # API routes and procedures
```

## 🔌 Available Node Types

### Trigger Nodes
- **Manual Trigger**: Execute workflows on-demand

### Execution Nodes
- **HTTP Request**: Make HTTP requests to external APIs
  - Supports all HTTP methods
  - Configurable headers and body
  - Response data available to subsequent nodes

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```bash
# Build the image
docker build -t nodebase .

# Run the container
docker run -p 3000:3000 nodebase
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Add proper error handling and validation
- Write meaningful commit messages
- Test your changes thoroughly

## 🐛 Troubleshooting

### Common Issues

**Workflow not executing:**
- Ensure Inngest dev server is running
- Check that event names match between API and functions
- Verify all required node fields are configured

**Database connection errors:**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npx prisma db push` to sync schema

**Authentication issues:**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the visual workflow editor
- [Inngest](https://www.inngest.com/) for reliable background job processing
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://www.prisma.io/) for database management

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

Built with ❤️ using modern web technologies