// Merge all Claude rating files into one master file
const fs = require('fs');
const path = require('path');

const ratingFiles = [
  'claude-subjective-test-10.json',
  'claude-subjective-prompts-11-20.json',
  'claude-subjective-prompts-21-25.json',
  'claude-subjective-run2-prompts-1-10.json',
  'claude-subjective-run2-prompts-11-20.json',
  'claude-subjective-run2-prompts-21-25.json'
];

const allRatings = [];

for (const file of ratingFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allRatings.push(...data.ratings);
    console.log(`Loaded ${data.ratings.length} ratings from ${file}`);
  }
}

const masterFile = {
  rater: "Claude Sonnet 4.5 - Comprehensive Subjective Evaluation",
  evaluationDate: "2026-03-26",
  totalRatings: allRatings.length,
  evaluationCriteria: {
    readability: "Structure, formatting, clarity, professionalism",
    understandability: "Appropriate for persona, clear concepts, jargon usage",
    accuracy: "Correct compliance info, valid citations, legally sound"
  },
  ratings: allRatings
};

fs.writeFileSync(
  path.join(__dirname, 'claude-all-150-ratings.json'),
  JSON.stringify(masterFile, null, 2)
);

console.log(`\n✅ Created master ratings file with ${allRatings.length} total ratings`);
console.log(`   File: ratings/claude-all-150-ratings.json`);

// Show distribution
const byModel = {};
allRatings.forEach(r => {
  if (!byModel[r.modelName]) byModel[r.modelName] = [];
  byModel[r.modelName].push(r.rating);
});

console.log(`\nRatings by model:`);
for (const [model, ratings] of Object.entries(byModel)) {
  const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
  console.log(`  ${model}: ${ratings.length} ratings, avg ${avg}/5`);
}
