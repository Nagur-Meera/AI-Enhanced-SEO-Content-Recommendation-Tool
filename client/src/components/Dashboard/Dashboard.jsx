import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import {
  FileText,
  TrendingUp,
  Target,
  Clock,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import Loading from '../common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const { stats, contents, loading, fetchStats, fetchContents } = useContent();

  useEffect(() => {
    fetchStats();
    fetchContents({ limit: 5, sort: 'updated' });
  }, [fetchStats, fetchContents]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  if (loading && !stats) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your SEO content performance</p>
        </div>
        <Link to="/content/new" className="btn btn-primary">
          <Plus size={20} />
          New Draft
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.stats?.totalDrafts || 0}</span>
            <span className="stat-label">Total Drafts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {Math.round(stats?.stats?.avgSEOScore || 0)}
            </span>
            <span className="stat-label">Avg SEO Score</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.stats?.optimizedCount || 0}</span>
            <span className="stat-label">Optimized</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {(stats?.stats?.totalWords || 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Words</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="dashboard-sections">
        {/* Recent Content */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Content</h2>
            <Link to="/content" className="section-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="content-list">
            {contents.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} strokeWidth={1} />
                <h3>No content yet</h3>
                <p>Create your first draft to get started</p>
                <Link to="/content/new" className="btn btn-primary">
                  <Plus size={18} />
                  Create Draft
                </Link>
              </div>
            ) : (
              contents.map((content) => (
                <Link
                  key={content._id}
                  to={`/content/${content._id}`}
                  className="content-item"
                >
                  <div className="content-info">
                    <h3>{content.title}</h3>
                    <div className="content-meta">
                      <span className={`badge badge-${content.status === 'optimized' ? 'success' : content.status === 'analyzing' ? 'warning' : 'gray'}`}>
                        {content.status}
                      </span>
                      <span className="meta-separator">•</span>
                      <Clock size={14} />
                      <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div
                    className={`score-badge score-${getScoreColor(content.currentSEOScore)}`}
                  >
                    <span className="score-value">{content.currentSEOScore}</span>
                    <span className="score-label">
                      {getScoreLabel(content.currentSEOScore)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <Link to="/content/new" className="action-card">
              <div className="action-icon">
                <Plus size={24} />
              </div>
              <div className="action-content">
                <h3>New Draft</h3>
                <p>Start writing new content</p>
              </div>
            </Link>
            <Link to="/content" className="action-card">
              <div className="action-icon">
                <FileText size={24} />
              </div>
              <div className="action-content">
                <h3>My Content</h3>
                <p>View and manage all drafts</p>
              </div>
            </Link>
          </div>

          {/* Tips Section */}
          <div className="tips-card">
            <h3>💡 SEO Tips</h3>
            <ul>
              <li>Include your primary keyword in the title</li>
              <li>Keep meta descriptions under 160 characters</li>
              <li>Aim for 1-3% keyword density</li>
              <li>Use headings (H2, H3) to structure content</li>
              <li>Write for readers first, search engines second</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
