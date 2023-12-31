const InternationalMatch = require('../models/internationalMatch');

const RECORDS_PER_REQUEST = 100;

exports.getMatches = async (req, res, next) => {
  const { page = 1 } = req.query;

  try {
    const data = await InternationalMatch.find()
      .skip((page - 1) * RECORDS_PER_REQUEST)
      .limit(RECORDS_PER_REQUEST)
      .populate('homeTeam', '-_id rank team points')
      .populate('awayTeam', '-_id rank team points');
    return res.status(200).json({ message: 'Success', data: data });
  } catch (error) {
    next(error);
  }
};

exports.searchMatchesByDate = async (req, res, next) => {
  const {
    date,
    dateHigherThan = '1850-01-01',
    dateLowerThan = '2049-01-01',
    page = 1,
  } = req.query;
  let query = { date: date };

  try {
    if (!date) {
      query = { date: { $gt: dateHigherThan, $lt: dateLowerThan } };
    }
    // total records
    const counted = await InternationalMatch.countDocuments(query);

    // get 100
    const data = await InternationalMatch.find(query)
      .skip((page - 1) * RECORDS_PER_REQUEST)
      .limit(RECORDS_PER_REQUEST)
      .populate('homeTeam', '-_id rank team points')
      .populate('awayTeam', '-_id rank team points');
    if (!data || data.length === 0) {
      return res.status(200).json({ message: "Can't find any matches" });
    }
    return res
      .status(200)
      .json({ page: +page, totalDocs: counted, message: 'Success', data: data });
  } catch (error) {
    next(error);
  }
};
