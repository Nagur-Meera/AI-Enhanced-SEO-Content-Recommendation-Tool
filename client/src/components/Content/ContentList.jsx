import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  History,
  Clock
} from 'lucide-react';
import Loading from '../common/Loading';
import './ContentList.css';

const ContentList = () => {
  const {
    contents,
    loading,
    fetchContents,
    deleteContent
  } = useContent();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    params.sort = sortBy;
    fetchContents(params);
  }, [fetchContents, statusFilter, sortBy]);

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(id);
        toast.success('Content deleted successfully');
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
    setOpenMenu(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const toggleMenu = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenu(openMenu === id ? null : id);
  };

  if (loading && contents.length === 0) {
    return <Loading text="Loading content..." />;
  }

  return (
    <div className="content-list-page">
      <div className="page-header">
        <div>
          <h1>My Content</h1>
          <p>Manage and optimize your content drafts</p>
        </div>
        <Link to="/content/new" className="btn btn-primary">
          <Plus size={20} />
          New Draft
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="optimized">Optimized</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="score">SEO Score</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContents.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📝</div>
          <h2>No content found</h2>
          <p>
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Start by creating your first content draft'}
          </p>
          {!searchTerm && (
            <Link to="/content/new" className="btn btn-primary">
              <Plus size={18} />
              Create First Draft
            </Link>
          )}
        </div>
      ) : (
        <div className="content-grid">
          {filteredContents.map((content) => (
            <div
              key={content._id}
              className="content-card"
              onClick={() => navigate(`/content/${content._id}`)}
            >
              <div className="card-header">
                <span className={`status-badge status-${content.status}`}>
                  {content.status}
                </span>
                <div className="card-menu">
                  <button
                    className="menu-trigger"
                    onClick={(e) => toggleMenu(content._id, e)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === content._id && (
                    <div className="menu-dropdown">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/content/${content._id}`);
                        }}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/content/${content._id}/analysis`);
                        }}
                      >
                        <BarChart3 size={16} />
                        Analysis
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/content/${content._id}/history`);
                        }}
                      >
                        <History size={16} />
                        History
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(content._id, e)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="card-title">{content.title}</h3>
              
              <p className="card-excerpt">
                {content.content?.substring(0, 120)}...
              </p>

              <div className="card-footer">
                <div className="card-meta">
                  <Clock size={14} />
                  <span>
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="separator">•</span>
                  <span>{content.wordCount} words</span>
                </div>
                <div
                  className={`score-pill score-${getScoreColor(content.currentSEOScore)}`}
                >
                  {content.currentSEOScore}
                </div>
              </div>

              {content.targetKeywords?.length > 0 && (
                <div className="card-keywords">
                  {content.targetKeywords.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                  {content.targetKeywords.length > 3 && (
                    <span className="keyword-more">
                      +{content.targetKeywords.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentList;
