const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Rynn UI",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Api Route
let totalRoutes = 0;
// Api Route
let totalRoutes = 0;
const loadedFiles = new Set(); // Track loaded files
const apiFolder = path.join(__dirname, './src/api');

// Error handling wrapper
const loadRoutes = (folder) => {
    fs.readdirSync(folder).forEach(item => {
        const fullPath = path.join(folder, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(fullPath); // Recursively process subdirectories
            return;
        }

        // Only process .js files that haven't been loaded
        if (path.extname(item) === '.js' && !loadedFiles.has(fullPath)) {
            try {
                const module = require(fullPath);
                
                if (typeof module === 'function') {
                    module(app);
                    loadedFiles.add(fullPath);
                    totalRoutes++;
                    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${item} `));
                } else {
                    console.error(chalk.bgRed.white.bold(` SKIPPED: ${item} - Does not export a function `));
                }
            } catch (error) {
                console.error(chalk.bgRed.white.bold(` ERROR in ${item}: ${error.message} `));
            }
        }
    });
};

loadRoutes(apiFolder);
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;