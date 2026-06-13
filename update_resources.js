const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/roadmap/resources.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Mapping keywords to Indonesian channels and playlists
const replacements = [
  // HTML / CSS / UI
  { match: /semantic html|html forms|html/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=NBZ9Ro6UKV8' },
  { match: /css|box model|flexbox|grid|responsive/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=CleFk3BZB3g' },
  { match: /accessibility/i, provider: 'Dea Afrizal', url: 'https://www.youtube.com/watch?v=kYJheWb6KqI' },
  
  // JS / TS
  { match: /javascript|variables|control flow|functions|scope|arrays|object methods|dom events|form validation|async javascript|fetch/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=RUTVcaa1SQE' },
  { match: /typescript/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=A2P3iP71tCE' },
  
  // React / Next.js
  { match: /react|props|state|lists|conditional|effects|custom hooks/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=5kHyviqjhCk' },
  { match: /next\.js|route handlers/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=HqAMCMEBRcg' },
  
  // Node.js / Express
  { match: /node\.js|nodejs|npm|environment/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=yW6I6eB9vT4' },
  { match: /express|routing|middleware|controllers|crud|rest api|http|error handling/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=gT8ZstY8c_U' },
  
  // Database / Postgres / Prisma
  { match: /sql|postgresql|tables|database/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=xM_0e8IuTns' },
  { match: /prisma|migrations/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=gT8ZstY8c_U' },
  
  // Auth / Security
  { match: /authentication|authorization|validation|security|bcrypt|jwt|session|protected/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=1F_X44D425w' },
  
  // Tooling / Git / Testing / Deploy
  { match: /git/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=lTMZxWMjXQU' },
  { match: /testing|jest|supertest/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=1F_X44D425w' }, // Unit test nodejs
  { match: /postman|thunder client/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=WxwG79FtyVw' },
  { match: /documentation/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=gT8ZstY8c_U' },
  { match: /deployment/i, provider: 'Dea Afrizal', url: 'https://www.youtube.com/watch?v=2Tz8iP1Hl40' },
  { match: /performance/i, provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/watch?v=v=kYJheWb6KqI' },
  { match: /json/i, provider: 'Programmer Zaman Now', url: 'https://www.youtube.com/watch?v=8b2O06_UItY' },
];

function getIndonesianResource(title) {
  for (let r of replacements) {
    if (r.match.test(title)) {
      return r;
    }
  }
  return { provider: 'Web Programming UNPAS', url: 'https://www.youtube.com/c/WebProgrammingUNPAS' };
}

// Regex to match youtube(...) lines
// Example: youtube('Semantic HTML fundamentals', 'https://...', 18, 'Traversy Media')
const youtubeRegex = /youtube\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)(?:\s*,\s*'([^']+)')?\s*\)/g;

content = content.replace(youtubeRegex, (match, title, oldUrl, minutes, oldProvider) => {
  const indo = getIndonesianResource(title);
  // Optional: keep original title, or modify. Let's keep original title because the task is about replacing the resources, not necessarily title
  // But maybe append "(Indonesian)"
  const newTitle = title.includes('(Indo)') ? title : `${title} (Indo)`;
  return `youtube('${newTitle}', '${indo.url}', ${minutes}, '${indo.provider}')`;
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated resources.ts with Indonesian YouTube links.');
