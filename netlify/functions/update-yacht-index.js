// Netlify Function — Auto-génère content/yachts/index.json
// Se déclenche automatiquement après chaque deploy
// Ce fichier permet au CMS de lister tous les yachts sans build script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Cette fonction est appelée en post-processing
  // Elle liste tous les fichiers JSON dans content/yachts/ (sauf index.json)
  // et met à jour index.json automatiquement
  
  try {
    const dir = path.join(process.cwd(), 'content', 'yachts');
    if (!fs.existsSync(dir)) {
      return { statusCode: 200, body: 'No yachts directory' };
    }
    
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json') && f !== 'index.json')
      .sort();
    
    const indexPath = path.join(dir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify({ yachts: files }, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ updated: true, yachts: files })
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
