export default {
  methods: {
    validateMimeTypes(files, allowedTypes) {
      const invalidFiles = files.filter(
        (file) => !allowedTypes.includes(file.type)
      );
      if (invalidFiles.length > 0) {
        return { valid: false, invalidFiles };
      }
      return { valid: true, invalidFiles: [] };
    },
    removeFalsyValuesfromObject(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => {
          // Check for all falsy values except 0
          return (
            v !== null &&
            v !== undefined &&
            v !== false &&
            v !== "" &&
            !(Array.isArray(v) && v.length === 0)
          );
        })
      );
    },
  },
};
