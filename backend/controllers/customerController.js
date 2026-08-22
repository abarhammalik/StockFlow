const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

/**
 * @desc    Get all customers (paginated & searchable) (Owner Scoped)
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (search) {
      const cleanSearch = search.replace(/[%,]/g, '');
      query = query.or(`name.ilike.%${cleanSearch}%,phone.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    const { data: customers, count, error } = await query;
    if (error) throw error;

    const total = count !== null ? count : (customers || []).length;
    const data = (customers || []).map(formatRecord);

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

/**
 * @desc    Lookup customer by phone number (Owner Scoped)
 * @route   GET /api/customers/phone/:phone
 * @access  Private
 */
const getCustomerByPhone = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { phone } = req.params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone.trim())
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: formatRecord(customer),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new customer (Owner Scoped)
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, phone, email = '', address = '', city = '', state = '', pincode = '', status = 'active' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
    }

    const cleanPhone = phone.trim();
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', cleanPhone)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
    }

    const { data: customer, error: insertErr } = await supabase
      .from('customers')
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.toLowerCase().trim() : null,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        status,
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: formatRecord(customer),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer (Owner Scoped)
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, phone, email, address, city, state, pincode, status } = req.body;

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found or access denied' });
    }

    if (phone && phone.trim() !== customer.phone) {
      const { data: phoneCheck } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone.trim())
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (phoneCheck && phoneCheck.id !== customer.id) {
        return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email !== undefined) updates.email = email ? email.toLowerCase().trim() : null;
    if (address !== undefined) updates.address = address.trim();
    if (city !== undefined) updates.city = city.trim();
    if (state !== undefined) updates.state = state.trim();
    if (pincode !== undefined) updates.pincode = pincode.trim();
    if (status !== undefined) updates.status = status;

    const { data: updatedCustomer, error: updateErr } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: formatRecord(updatedCustomer),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
};
