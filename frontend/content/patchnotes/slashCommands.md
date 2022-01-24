Time for an update!

## 💬 Slash Commands

"Wait, my `.commands` are gone!"

Yes. But they live on in `/commands`!

Discord is pushing all bots to move to slash commands. These are preregistered, which means that if you type a slash into chat, you can see all valid commands and even get autocompletion and argument types for certain commands.

All it really means for you now is that you'll need to type '/' instead of '.' to start commands.

**HOWEVER.**

To run slash commands, the bot requires an additional permission, which means you'll need to reauthorize the bot by using this link: https://discord.com/api/oauth2/authorize?client_id=804439178636558396&permissions=277361060944&scope=applications.commands%20bot

Sorry for the inconvenience!

### Other minor changes

- Should now be able to remove crew members who are "stuck" on the ship after they leave the server.
- **Heavily** optimized data transfer between the server and the frontend. Speedier = better.
- Introduced ship deletion if no crew member has been active for 4 weeks. It will warn you one day before your ship is deleted.
