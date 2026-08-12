const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const { module, page = 1, limit = 20 } = req.query;
    const query = {};
    if (module) query.module = module;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: logs.length,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
