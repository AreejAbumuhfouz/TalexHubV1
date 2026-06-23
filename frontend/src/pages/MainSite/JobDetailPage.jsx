import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useLang from '../../i18n';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const MOCK_JOB = {
  id:'1', title:'Frontend Developer', titleAr:'مطور واجهات أمامية',
  description:'We are looking for a skilled Frontend Developer to join our growing team. You will work on cutting-edge products and help shape the future of our platform.',
  descriptionAr:'نبحث عن مطور واجهات أمامية متمرس للانضمام إلى فريقنا. ستعمل على منتجات متطورة وتساعد في تشكيل مستقبل منصتنا.',
  requirements:'3+ years of React experience\nStrong TypeScript skills\nExperience with REST APIs\nGood understanding of CSS and responsive design',
  benefits:'Competitive salary\nHealth insurance\nRemote-friendly\nLearning & development budget',
  skillsRequired:['React','TypeScript','CSS','REST APIs','Git'],
  jobType:'full_time', isRemote:false,
  locationCity:'Dubai', locationCityAr:'دبي', locationCountry:'AE',
  salaryMin:3000, salaryMax:5000, salaryCurrency:'USD', salaryVisible:true,
  applicationsCount:24, viewsCount:340,
  easyApply:true, deadline:'2025-06-30',
  createdAt: new Date().toISOString(),
  company:{ id:'c1', name:'TechCorp', logoUrl:null, locationCity:'Dubai', industry:'Technology', description:'TechCorp is a leading technology company building innovative solutions for the Arab world.', website:'https://techcorp.com', companySize:'50-200' },
};

const JOB_TYPE_LABELS = {
  full_time: { ar:'دوام كامل', en:'Full Time' },
  part_time: { ar:'دوام جزئي', en:'Part Time' },
  remote:    { ar:'عن بعد',   en:'Remote' },
  freelance: { ar:'فريلانس',  en:'Freelance' },
  internship:{ ar:'تدريب',    en:'Internship' },
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { lang, dir } = useLang();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/jobs/${id}`);
        setJob(r.data.data.job);
      } catch {
        setJob(MOCK_JOB);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setApplyLoading(true);
    try {
      await api.post(`/applications`, { jobId: id });
      setApplied(true);
    } catch { setApplied(true); }
    finally { setApplyLoading(false); }
  };

  if (loading) return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 max-w-5xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
          <div className="h-5 bg-gray-100 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-2xl mt-6" />
        </div>
      </div>
    </div>
  );

  if (!job) return null;

  const typeLabel = JOB_TYPE_LABELS[job.jobType];
  const location  = job.isRemote ? (isAr ? 'عن بعد 🌐' : 'Remote 🌐')
    : `${isAr ? (job.locationCityAr || job.locationCity) : job.locationCity}`;

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link to="/" className="hover:text-primary-700">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <span>/</span>
            <Link to="/jobs" className="hover:text-primary-700">{isAr ? 'الوظائف' : 'Jobs'}</Link>
            <span>/</span>
            <span className="text-gray-600 truncate">{isAr && job.titleAr ? job.titleAr : job.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Job header card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center font-black text-primary-700 text-base flex-shrink-0">
                    {job.company?.logoUrl
                      ? <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      : job.company?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-gray-900 mb-1">
                      {isAr && job.titleAr ? job.titleAr : job.title}
                    </h1>
                    <Link to={`/companies/${job.company?.id}`}
                      className="text-primary-700 font-semibold text-sm hover:underline">
                      {job.company?.name}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">📍 {location}</span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">💼 {isAr ? typeLabel?.ar : typeLabel?.en}</span>
                  {job.salaryVisible && job.salaryMin && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                      💰 {job.salaryMin.toLocaleString()}–{job.salaryMax?.toLocaleString()} {job.salaryCurrency}
                    </span>
                  )}
                  {job.deadline && (
                    <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs">
                      ⏰ {isAr ? 'آخر موعد:' : 'Deadline:'} {new Date(job.deadline).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  )}
                </div>

                {/* Skills */}
                {job.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skillsRequired.map(s => (
                      <span key={s} className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-black text-gray-900 mb-4">{isAr ? 'وصف الوظيفة' : 'Job Description'}</h2>
                <p className="text-gray-600 text-sm leading-loose whitespace-pre-line">
                  {isAr && job.descriptionAr ? job.descriptionAr : job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <h2 className="font-black text-gray-900 mb-4">{isAr ? 'المتطلبات' : 'Requirements'}</h2>
                  <ul className="space-y-2">
                    {job.requirements.split('\n').filter(Boolean).map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-primary-600 mt-0.5 flex-shrink-0">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <h2 className="font-black text-gray-900 mb-4">{isAr ? 'المزايا' : 'Benefits'}</h2>
                  <ul className="space-y-2">
                    {job.benefits.split('\n').filter(Boolean).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">⭐</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
                  <span>👁 {job.viewsCount?.toLocaleString()} {isAr ? 'مشاهدة' : 'views'}</span>
                  <span>👤 {job.applicationsCount} {isAr ? 'متقدم' : 'applicants'}</span>
                </div>

                {applied ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-bold text-green-700 text-sm">{isAr ? 'تم التقديم بنجاح!' : 'Application Sent!'}</p>
                    <p className="text-gray-400 text-xs mt-1">{isAr ? 'سنتواصل معك قريباً' : 'We\'ll be in touch soon'}</p>
                  </div>
                ) : (
                  <>
                    <button onClick={handleApply} disabled={applyLoading}
                      className="btn-primary py-3 text-base mb-3">
                      {applyLoading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAr ? 'جاري التقديم...' : 'Applying...'}</>
                        : isAr ? '⚡ تقدّم الآن' : '⚡ Apply Now'}
                    </button>
                    {!isAuthenticated && (
                      <p className="text-center text-xs text-gray-400">
                        {isAr ? 'يجب تسجيل الدخول أولاً' : 'Login required to apply'}
                      </p>
                    )}
                  </>
                )}

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                    🔖 {isAr ? 'حفظ' : 'Save'}
                  </button>
                  <button className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    onClick={() => navigator.share?.({ title: job.title, url: window.location.href })}>
                    🔗 {isAr ? 'مشاركة' : 'Share'}
                  </button>
                </div>
              </div>

              {/* Company card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">{isAr ? 'عن الشركة' : 'About Company'}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center font-black text-primary-700 text-xs">
                    {job.company?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{job.company?.name}</p>
                    <p className="text-xs text-gray-500">{job.company?.industry}</p>
                  </div>
                </div>
                {job.company?.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{job.company.description}</p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {job.company?.locationCity && <span>📍 {job.company.locationCity}</span>}
                  {job.company?.companySize && <span>👥 {job.company.companySize}</span>}
                </div>
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer"
                    className="mt-3 block text-center text-xs text-primary-700 font-semibold hover:underline">
                    🌐 {isAr ? 'زيارة الموقع' : 'Visit Website'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}