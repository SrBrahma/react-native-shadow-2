


To run your project, navigate to the directory and run one of the following npm commands:
  - npm start # you can open iOS, Android, or web from here, or run them directly with the commands below.
  - npm run android
  - npm run ios # requires an iOS device or macOS for access to an iOS simulator
  - npm run web


The index.tsx is a linked file to the parent src/index.tsx, the package source file, as we can't directly import it as it's outside the expo/react-native directory. If your File System doesn't support links, manually copy the src/index.tsx from the package to the src/index.tsx of this sandbox directory.

# [Changelog](CHANGELOG.md)