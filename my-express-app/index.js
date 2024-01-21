const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});