module.exports = {
  purge: ["./index.html"],
  variants: {
    extend: {
      backgroundOpacity: ["hover"],
      visibility: ["group-hover"],
      borderWidth: ["last"],
    },
  },
  plugins: [],
};
