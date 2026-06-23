'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const usageController = require('../controllers/usage.controller');

router.use(protect);

// Dashboard
router.get('/dashboard', usageController.getDashboard);

// API Settings
router.get('/api-settings',    usageController.getApiSettings);
router.put('/api-settings',    usageController.updateApiSettings);
router.post('/test-api-key',   usageController.testApiKey);

// Usage Logs
router.get('/logs',            usageController.getUsageLogs);
router.get('/logs/:id',        usageController.getUsageLogDetail);
router.delete('/logs/clear',   usageController.clearOldLogs);

// Statistics
router.get('/stats',           usageController.getUsageStats);
router.get('/user-usage',      usageController.getUserUsage);

// Balance
router.put('/balance',         usageController.updateBalance);

// Alert Settings
router.get('/alerts/settings', usageController.getAlertSettings);
router.put('/alerts/settings', usageController.updateAlertSettings);
router.post('/alerts/check',   usageController.checkAlerts);
router.post('/alerts/test',    usageController.testAlert);

// Simulation
router.post('/simulate',       usageController.simulateUsage);

module.exports = router;
