# 🚀 Nodebase - Your Personal Automation Powerhouse

Hi there! Welcome to **Nodebase**. 👋

Think of this as your own personal control center for automating tasks. It's a visual tool (like a whiteboard) where you can connect different services together to make things happen automatically.

Built with the latest and greatest tech (Next.js, React Flow, Inngest), it's designed to be powerful for developers but friendly enough for anyone to understand.

---

## ✨ What can it do?

*   **Visual Building**: No complex code. Just drag blocks, drop them, and connect the dots. 🎨
*   **Reliable**: It uses a smart system (Inngest) to make sure your workflows finish their job, even if something hiccups. 🛡️
*   **Connect Anything**: Use "HTTP Request" blocks to talk to almost any service on the internet. 🌐
*   **Secure**: Your data is yours. It comes with built-in login and security. 🔒
*   **Lookin' Good**: It's easy on the eyes, thanks to a modern design. 😎

---

## 🛠️ The Tech Under the Hood

For the curious developers out there, here's what makes it tick:

*   **Frontend**: Next.js 15, React, TypeScript (The face of the app)
*   **Visuals**: React Flow (The drag-and-drop magic)
*   **Styling**: Tailwind CSS & shadcn/ui (The pretty colors and buttons)
*   **Backend Engine**: Inngest (The brain that runs tasks)
*   **Database**: PostgreSQL with Prisma (The memory)
*   **Auth**: NextAuth.js (The bouncer)

---

## 🏁 Get Started in 5 Minutes

Want to take it for a spin? Here is how to set it up on your machine.

### Prerequisites (What you need first)
*   [Node.js](https://nodejs.org/) (Version 18 or higher)
*   A [PostgreSQL](https://www.postgresql.org/) database active and ready.
*   `npm` or `yarn` (comes with Node.js).

### Installation Steps

1.  **Grab the Code**:
    ```bash
    git clone https://github.com/Mayank-saraswal/n8n.git
    cd nodebase
    ```

2.  **Install the "Parts"**:
    ```bash
    npm install
    ```

3.  **Secrets & Config**:
    We need to tell the app where your database is.
    ```bash
    cp .env.example .env.local
    ```
    Now, open `.env.local` and fill in your details (Database URL, Secret keys, etc.).

4.  **Prep the Database**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Ignition! 🚀**:
    Start the app:
    ```bash
    npm run dev
    ```

6.  **Start the Engine** (New Terminal):
    The app needs the background engine running too.
    ```bash
    npx inngest-cli@latest dev
    ```

Visit `http://localhost:3000` and you're in! 🎉

---

## � How to Play

### 1. Create a Workflow
Go to the **Workflows** page and hit **Create**. You'll see a blank canvas. This is your playground.

### 2. Add Stuff
*   **Manual Trigger**: This is your "Start" button. Every workflow needs a trigger.
*   **HTTP Request**: Want to fetch weather data? Post a tweet? Send a message to Discord? Use this.

### 3. Connect & Configure
*   Draw lines between nodes to connect them.
*   Click a node to change its settings (like the URL you want to hit).
*   **Pro Tip**: You can use data from previous steps! If your first step got some data, you can use it in the second step like this: `{{stepName.data}}`.

### 4. Run It!
Click **Execute Workflow** and watch the magic happen. You can see the status of every run.

---

## ❓ Stuck?

*   **Workflow not running?** Make sure you ran that second terminal command (`npx inngest-cli...`). It's the engine!
*   **Database error?** Double-check that `DATABASE_URL` in your `.env` file. It needs to be perfect.
*   **Something else?** Open an issue on GitHub, and we'll help you out.

---

## � License

MIT License. Basically, do cool stuff with this project.

---

Made with ❤️ by [Mayank Saraswal](https://github.com/Mayank-saraswal). Happy Automating!
 

 Bye ! 