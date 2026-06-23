
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';
import { FEATURES_DATA } from '../../../data/featuresData';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Map icons to emoji or simple icons for the original design
const getIconEmoji = (iconName) => {
  const iconMap = {
    'FileText': '📄',
    'Mail': '✉️',
    'Mic': '🎤',
    'Map': '🗺️',
    'Zap': '⚡',
    'Layout': '📐',
  };
  return iconMap[iconName] || '✨';
};

export default function Features() {
  const { lang, dir } = useLangStore();
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const [active, setActive] = useState(0);
  
  // Show only first 4 features
  const displayedFeatures = FEATURES_DATA.slice(0, 4);

  const handleFeatureClick = (feature, index) => {
    setActive(index);
    if (feature.path) {
      navigate(feature.path);
    }
  };

  return (
    <section 
      aria-label={isAr ? 'مميزات المنصة' : 'Platform features'}
      style={{ padding: '62px 24px', background: 'var(--bg-primary)' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }} dir={dir}>
        {/* Section head */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          style={{ marginBottom: 52 }}
        >
          <span style={{ 
            display: 'inline-block', 
            fontSize: 11, 
            fontWeight: 600, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            color: 'var(--text-secondary)', 
            fontFamily: 'var(--font-en)', 
            marginBottom: 16 
          }}>
            {isAr ? 'المميزات' : 'Features'}
          </span>
          <h2 style={{ 
            fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.03em', 
            lineHeight: 1.15, 
            marginBottom: 14, 
            fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' 
          }}>
            {isAr ? 'كل ما تحتاجه في مكان واحد' : 'Everything You Need in One Place'}
          </h2>
          <p style={{ 
            fontSize: 16, 
            color: 'var(--text-secondary)', 
            lineHeight: 1.8, 
            maxWidth: 480,
            marginBottom: 32
          }}>
            {isAr
              ? 'منصة متكاملة تجمع بين الذكاء الاصطناعي وأفضل الممارسات المهنية لتسريع مسيرتك الوظيفية'
              : 'A complete platform combining AI and best professional practices to accelerate your career journey'}
          </p>
          
          {/* View All Features Button */}
          <Link 
            to="/features"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              borderRadius: 10,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {isAr ? 'جميع الميزات' : 'All Features'}
            {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </Link>
        </motion.div>

        {/* Cards - Only first 4 features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {displayedFeatures.map((feature, i) => {
            const tag = feature.badge ? (isAr ? feature.badge.ar : feature.badge.en) : null;
            const act = active === i;
            const title = isAr ? feature.title.ar : feature.title.en;
            const description = isAr ? feature.tagline.ar : feature.tagline.en;
            
            return (
              <motion.article 
                key={feature.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: i * 0.07 }}
                onClick={() => handleFeatureClick(feature, i)}
                style={{
                  padding: '26px', 
                  borderRadius: 16, 
                  cursor: 'pointer',
                  border: `1.5px solid ${act ? 'var(--text-primary)' : 'var(--border)'}`,
                  background: act ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  position: 'relative', 
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                }}
                whileHover={{ y: act ? 0 : -3 }}
                onMouseEnter={e => { if (!act) e.currentTarget.style.borderColor = 'var(--accent-400)'; }}
                onMouseLeave={e => { if (!act) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {tag && (
                  <span style={{
                    position: 'absolute', 
                    top: 14, 
                    insetInlineEnd: 14,
                    fontSize: 10, 
                    fontWeight: 700, 
                    padding: '3px 10px', 
                    borderRadius: 99,
                    background: feature.badgeColor ? `${feature.badgeColor}15` : 'var(--bg-tertiary)',
                    color: feature.badgeColor || 'var(--text-secondary)',
                    letterSpacing: '0.05em', 
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-en)',
                  }}>
                    {tag}
                  </span>
                )}

                <div style={{
                  width: 46, 
                  height: 46, 
                  borderRadius: 12,
                  background: act ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 22, 
                  marginBottom: 18,
                  filter: act ? 'grayscale(1) invert(1)' : 'none',
                  transition: 'background 0.25s ease, filter 0.25s ease',
                }}>
                  {getIconEmoji(feature.icon)}
                </div>

                <h3 style={{ 
                  fontSize: 15, 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginBottom: 10, 
                  letterSpacing: '-0.01em',
                  fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)'
                }}>
                  {title}
                </h3>
                
                <p style={{ 
                  fontSize: 13.5, 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.75,
                  fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)'
                }}>
                  {description}
                </p>

                {act && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    insetInlineStart: 0, 
                    insetInlineEnd: 0, 
                    height: 3, 
                    background: 'var(--text-primary)', 
                    borderRadius: '0 0 16px 16px' 
                  }} />
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}