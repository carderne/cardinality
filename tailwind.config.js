module.exports = {
  purge: ["./index.html"],
  variants: {
    extend: {
      //backgroundOpacity: ["hover"],
      backgroundColor: ['even', 'odd'],
      visibility: ["group-hover"],
      //borderWidth: ["last"],
    },
  },
  plugins: [],
};
