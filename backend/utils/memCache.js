'use strict';

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           memCache — بديل Redis للـ Cache           ║
 * ║     نفس الـ API تقريباً: get / set / del / flush    ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * المميزات:
 *  - TTL تلقائي لكل مفتاح
 *  - تنظيف تلقائي للمفاتيح المنتهية
 *  - خفيف جداً — بدون أي dependency خارجية
 */

class MemCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number | null }>} */
    this._store = new Map();

    // ✅ تنظيف تلقائي كل 5 دقائق
    setInterval(() => this._evict(), 5 * 60 * 1000).unref();
  }

  // ─────────────────────────────────────────
  // SET  — يحفظ قيمة مع TTL اختياري (بالثواني)
  // ─────────────────────────────────────────
  set(key, value, ttlSeconds = null) {
    this._store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return this;
  }

  // ─────────────────────────────────────────
  // GET  — يرجع القيمة أو null إذا انتهت أو مش موجودة
  // ─────────────────────────────────────────
  get(key) {
    const item = this._store.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this._store.delete(key);
      return null;
    }

    return item.value;
  }

  // ─────────────────────────────────────────
  // DEL  — يحذف مفتاح واحد
  // ─────────────────────────────────────────
  del(key) {
    this._store.delete(key);
    return this;
  }

  // ─────────────────────────────────────────
  // HAS  — يتحقق إذا المفتاح موجود وما انتهى
  // ─────────────────────────────────────────
  has(key) {
    return this.get(key) !== null;
  }

  // ─────────────────────────────────────────
  // FLUSH — يمسح كل شيء
  // ─────────────────────────────────────────
  flush() {
    this._store.clear();
    return this;
  }

  // ─────────────────────────────────────────
  // STATS — للـ health check والمراقبة
  // ─────────────────────────────────────────
  stats() {
    let active = 0;
    let expired = 0;
    const now = Date.now();

    for (const item of this._store.values()) {
      if (item.expiresAt && now > item.expiresAt) expired++;
      else active++;
    }

    return { total: this._store.size, active, expired };
  }

  // ─────────────────────────────────────────
  // EVICT — يمسح المفاتيح المنتهية (داخلي)
  // ─────────────────────────────────────────
  _evict() {
    const now = Date.now();
    for (const [key, item] of this._store.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this._store.delete(key);
      }
    }
  }
}

// ✅ Singleton — نفس الـ instance في كل التطبيق
const memCache = new MemCache();

module.exports = { memCache, MemCache };