module.exports = {
  purge: ["./index.html"],
  variants: {
    extend: {
      backgroundOpacity: ["hover"],
      //textColor: ["hover"],
      backgroundColor: ['even', 'odd'],
      visibility: ["group-hover"],
      //borderWidth: ["last"],
    },
  },
  plugins: [],
};
