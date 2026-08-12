const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

/**
 * @desc    Get all customers (paginated & searchable)
 * @route   GET /api/customers
 */
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: customers.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lookup customer by phone number (for billing quick-fill)
 * @route   GET /api/customers/phone/:phone
 */
const getCustomerByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ phone: phone.trim() });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 */
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address, city, state, pincode } = req.body;

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
    }

    const customer = await Customer.create({
      name,
      phone: phone.trim(),
      email,
      address,
      city,
      state,
      pincode,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 */
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
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
