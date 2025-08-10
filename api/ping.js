module.exports = async (req, res) => {
  console.log('ping hit', { method: req.method });
  res.status(200).json({ ok: true, method: req.method });
};
