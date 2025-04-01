module.exports = (on, config) => {
    on('task', {
      readFileMaybe(filename) {
        try {
          return require(filename);
        } catch (e) {
          return null;
        }
      }
    });
    }