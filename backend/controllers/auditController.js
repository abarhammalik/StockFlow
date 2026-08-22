const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

/**
 * @desc    Get audit logs (Owner Scoped)
 * @route   GET /api/audit-logs
 * @access  Private
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { module: moduleFilter, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (moduleFilter) {
      query = query.eq('module', moduleFilter);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    const { data: logs, count, error } = await query;
    if (error) throw error;

    const total = count !== null ? count : (logs || []).length;
    const data = (logs || []).map(formatRecord);

    res.json({
      success: true,
      count: data.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
