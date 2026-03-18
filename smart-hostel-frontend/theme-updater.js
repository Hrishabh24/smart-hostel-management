const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'pages'),
];

const excludeFiles = ['Home.jsx', 'AdminLogin.jsx', 'Login.jsx', 'Signup.jsx'];

function traverseDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath, callback);
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
        callback(fullPath);
      }
    }
  }
}

const replaceRules = [
  // Layout and Backgrounds
  { regex: /bg-\[#F4F6F9\]/g, replacement: "bg-[#0B0F19]" },
  { regex: /bg-\[#F8F9FA\]/g, replacement: "bg-[#0B0F19]" },
  { regex: /bg-gray-100/g, replacement: "bg-[#0B0F19]/50" },
  { regex: /bg-gray-50/g, replacement: "bg-[#0B0F19]/30" },
  { regex: /bg-white/g, replacement: "bg-[#131B2F]/80 backdrop-blur-md border border-white/5" },
  
  // Text Colors
  { regex: /text-gray-900/g, replacement: "text-white" },
  { regex: /text-gray-800/g, replacement: "text-gray-100" },
  { regex: /text-gray-700/g, replacement: "text-gray-300" },
  { regex: /text-gray-600/g, replacement: "text-gray-400" },
  { regex: /text-gray-500/g, replacement: "text-gray-400" },
  { regex: /text-\[#212529\]/g, replacement: "text-white" },

  // Primary Theme Colors (Green/Blue to Purple/Blue Gradient)
  { regex: /bg-\[#2E7D32\]/g, replacement: "bg-gradient-to-br from-purple-600 to-blue-600" },
  { regex: /bg-\[#1976D2\]/g, replacement: "bg-gradient-to-br from-purple-600 to-blue-600" },
  { regex: /text-\[#2E7D32\]/g, replacement: "text-purple-400" },
  { regex: /text-\[#1976D2\]/g, replacement: "text-blue-400" },
  

  // Hover states
  { regex: /hover:bg-\[#1B5E20\]/g, replacement: "hover:bg-white/10" },
  { regex: /hover:bg-\[#1565C0\]/g, replacement: "hover:bg-white/10" },
  { regex: /hover:bg-gray-100/g, replacement: "hover:bg-white/10" },
  { regex: /hover:bg-gray-50/g, replacement: "hover:bg-white/5" },
  { regex: /hover:text-gray-900/g, replacement: "hover:text-white" },

  // Borders
  { regex: /border-gray-200/g, replacement: "border-white/10" },
  { regex: /border-gray-300/g, replacement: "border-white/10" },
  { regex: /border-b(?![a-zA-Z\-])/g, replacement: "border-b border-white/10" },

  // Shadows
  { regex: /shadow-md/g, replacement: "shadow-[0_8px_30px_rgba(0,0,0,0.4)]" },
  { regex: /shadow-lg/g, replacement: "shadow-[0_15px_40px_rgba(0,0,0,0.5)]" },
  { regex: /shadow([^a-zA-Z\-])/g, replacement: "shadow-[0_4px_20px_rgba(0,0,0,0.3)]$1" },

  // Buttons and Form controls
  { regex: /bg-blue-500 hover:bg-blue-600/g, replacement: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_4px_15px_rgba(147,51,234,0.3)]" },
  { regex: /bg-gradient-to-br from-\[#2E7D32\] to-\[#1B5E20\]/g, replacement: "bg-gradient-to-br from-purple-600/90 to-blue-600/90 hover:from-purple-500 hover:to-blue-500" },
  { regex: /bg-gradient-to-br from-\[#1976D2\] to-\[#1565C0\]/g, replacement: "bg-gradient-to-br from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500" },
  { regex: /bg-gradient-to-br from-\[#F57C00\] to-\[#E65100\]/g, replacement: "bg-gradient-to-br from-pink-600/90 to-purple-600/90 hover:from-pink-500 hover:to-purple-500" },
  
  // Specific Form Backgrounds
  { regex: /focus:ring-blue-500/g, replacement: "focus:ring-purple-500" },
  { regex: /focus:border-blue-500/g, replacement: "focus:border-purple-500" },
];

function processFile(filePath) {
  if (excludeFiles.some(exc => filePath.endsWith(exc))) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replaceRules.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });

  // some specific cleanups
  content = content.replace(/border-b border-white\/10 /g, "border-b border-white/10 ");
  content = content.replace(/bg-\[#131B2F\]\/80 backdrop-blur-md border border-white\/5 opacity-50/g, "bg-white/5 border border-white/10 opacity-50");
  
  // Specifically fix dashboard root background inside components that lack layouts initially (like Student views)
  content = content.replace(/className="flex-1 p-10 bg-\[#0B0F19\] min-h-screen"/g, 'className="flex-1 p-10 bg-[#0B0F19] min-h-screen relative z-10"');
  content = content.replace(/className="flex"/g, 'className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

directoriesToProcess.forEach(dir => traverseDirectory(dir, processFile));
console.log('Update Complete.');
