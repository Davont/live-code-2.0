"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/prebuild.ts
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
// This script creates a virtual file system of our core dependencies
// by reading them from node_modules and storing them in a JSON file.
const packages = ['react', 'react-dom', 'scheduler'];
const prebuild = async () => {
    console.log('Starting pre-build script to create virtual file system...');
    const virtualFS = {};
    for (const pkg of packages) {
        console.log(`Processing package: ${pkg}`);
        // Find the package's directory in node_modules
        const pkgPath = path_1.default.dirname(require.resolve(`${pkg}/package.json`));
        // Find all files within the package directory
        const files = (0, glob_1.sync)('**/*.{js,cjs,mjs,json}', {
            cwd: pkgPath,
            ignore: ['**/*.test.js', '**/__tests__/**'],
        });
        for (const file of files) {
            const filePath = path_1.default.join(pkgPath, file);
            const content = await fs_extra_1.default.readFile(filePath, 'utf-8');
            // The key in our virtual FS will be the package name + relative path
            const virtualPath = path_1.default.join(pkg, file).replace(/\\/g, '/');
            virtualFS[virtualPath] = content;
        }
    }
    const outputPath = path_1.default.join(process.cwd(), 'public', 'dependencies.json');
    await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
    await fs_extra_1.default.writeJson(outputPath, virtualFS, { spaces: 2 }); // Use spaces for readability
    console.log(`Successfully created virtual file system at: ${outputPath}`);
};
prebuild().catch(err => {
    console.error('Pre-build script failed:', err);
    process.exit(1);
});
