const Newsletter = require('../models/Newsletter');
const { Op } = require('sequelize');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email, source = 'footer' } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check if already subscribed
    const existing = await Newsletter.findOne({ where: { email: email.toLowerCase() } });
    
    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Re-activate subscription
        await existing.update({
          status: 'active',
          unsubscribedAt: null,
          subscribedAt: new Date(),
          source,
          ipAddress,
          userAgent
        });
        
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          data: { email: existing.email }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      });
    }

    // Create new subscription
    const subscription = await Newsletter.create({
      email: email.toLowerCase(),
      source,
      ipAddress,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        email: subscription.email,
        subscribedAt: subscription.subscribedAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscription = await Newsletter.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    await subscription.update({
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'active' } = req.query;
    const offset = (page - 1) * limit;
    
    const where = status !== 'all' ? { status } : {};
    
    const { count, rows } = await Newsletter.findAndCountAll({
      where,
      order: [['subscribedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        subscribers: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

// Get subscriber statistics (admin only)
exports.getSubscriberStats = async (req, res) => {
  try {
    const [total, active, unsubscribed, today] = await Promise.all([
      Newsletter.count(),
      Newsletter.count({ where: { status: 'active' } }),
      Newsletter.count({ where: { status: 'unsubscribed' } }),
      Newsletter.count({
        where: {
          subscribedAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: { total, active, unsubscribed, today }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Delete subscriber (admin only)
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Newsletter.destroy({ 
      where: { id: parseInt(id) } 
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
};

// Export subscribers to CSV (admin only)
exports.exportSubscribers = async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    const where = status !== 'all' ? { status } : {};
    
    const subscribers = await Newsletter.findAll({
      where,
      order: [['subscribedAt', 'DESC']]
    });

    // Create CSV
    const csvRows = [
      ['ID', 'Email', 'Status', 'Subscribed At', 'Unsubscribed At', 'Source', 'IP Address']
    ];

    for (const sub of subscribers) {
      csvRows.push([
        sub.id,
        sub.email,
        sub.status,
        sub.subscribedAt,
        sub.unsubscribedAt || '',
        sub.source,
        sub.ipAddress || ''
      ]);
    }

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter_subscribers_${Date.now()}.csv`);
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscribers'
    });
  }
};