// Clubs that have an events page. The key is the id used in /events/:clubId.
// Only ids listed here can be rendered, which stops the URL from choosing arbitrary templates.
module.exports = {
  Code_IO: { view: "code_io", name: "Code I/O" },
  protocol: { view: "protocol", name: "Protocol" },
  ise: { view: "ise", name: "ISE Student Club" },
  augmentai: { view: "augmentai", name: "Augment AI" },
  IEEEcs: { view: "IEEEcs", name: "IEEE Computer Society" },
  pes: { view: "pes", name: "PES and Sensors Council" },
  wie: { view: "wie", name: "IEEE Women in Engineering" },
  upagraha: { view: "upagraha", name: "Upagraha" },
  pentagram: { view: "pentagram", name: "Pentagram" },
  robotics: { view: "robotics", name: "Robotics Club" },
  bullz: { view: "bullz", name: "Bullz Racing" },
  aerobmsce: { view: "aerobmsce", name: "AeroBMSCE" },
};
