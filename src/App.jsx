import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiTrash, BiPlus } from 'react-icons/bi';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://cpnbackend-production.up.railway.app';

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    tasteProfile: { sweet: 0, sour: 0, tangy: 0, spice: 0 },
    idealWith: [],
    variants: [
      { weightLabel: '250g', price: 0 },
      { weightLabel: '500g', price: 0 }
    ]
  });
  
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/masalas`);
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTasteChange = (val, type) => {
    setFormData(prev => ({
      ...prev,
      tasteProfile: { ...prev.tasteProfile, [type]: Number(val) }
    }));
  };

  const handleMealChange = (meal) => {
    setFormData({
      ...formData,
      idealWith: formData.idealWith.includes(meal)
        ? formData.idealWith.filter(m => m !== meal)
        : [...formData.idealWith, meal]
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
        setErrors(prev => ({ ...prev, imageUrl: null }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { weightLabel: '', price: 0 }]
    }));
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) return;
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = field === 'price' ? Number(value) : value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
    // Clear error for this field
    if (errors[`${field}_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${field}_${index}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.description.trim()) newErrors.description = "Product description is required.";
    if (!formData.imageUrl) newErrors.imageUrl = "An image must be uploaded.";
    
    formData.variants.forEach((v, i) => {
      if (!v.weightLabel.trim()) newErrors[`weightLabel_${i}`] = "Required";
      if (v.price <= 0) newErrors[`price_${i}`] = "Invalid";
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await axios.post(`${API_URL}/api/v1/masalas`, formData);
      alert('Product created successfully!');
      fetchProducts();
      setFormData({
        name: '', subtitle: '', description: '', imageUrl: '',
        tasteProfile: { sweet: 0, sour: 0, tangy: 0, spice: 0 },
        idealWith: [],
        variants: [
          { weightLabel: '250g', price: 0 },
          { weightLabel: '500g', price: 0 }
        ]
      });
      if (document.getElementById('imageUploader')) {
        document.getElementById('imageUploader').value = '';
      }
      setErrors({});
    } catch (error) {
      console.error(error);
      alert('Error saving product!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/masalas/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to delete.');
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5 px-3">
      <nav className="navbar navbar-dark bg-dark shadow-sm px-4 mb-4 rounded-bottom-4">
        <span className="navbar-brand fw-bold mb-0 h1">CPN Foods Admin Panel</span>
      </nav>

      <div className="container-fluid">
        <div className="row g-4">
          
          {/* Add Form */}
          <div className="col-12 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-danger text-white py-3 border-0">
                <h5 className="m-0 fw-bold">Publish New Product</h5>
              </div>
              <div className="card-body p-4 bg-white">
                <form onSubmit={handleSubmit} noValidate>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Product Name <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control border-0 bg-light ${errors.name ? 'is-invalid' : ''}`} placeholder="e.g. Garam Masala" value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); if(errors.name) setErrors({...errors, name: null});}} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Subtitle (Optional)</label>
                    <input type="text" className="form-control border-0 bg-light" placeholder="e.g. Authentic Spice Mix" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Description <span className="text-danger">*</span></label>
                    <textarea className={`form-control border-0 bg-light ${errors.description ? 'is-invalid' : ''}`} rows="3" placeholder="Describe the flavors..." value={formData.description} onChange={e => {setFormData({...formData, description: e.target.value}); if(errors.description) setErrors({...errors, description: null});}}></textarea>
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted">Upload Image <span className="text-danger">*</span></label>
                    <input id="imageUploader" type="file" accept="image/*" className={`form-control border-0 bg-light ${errors.imageUrl ? 'is-invalid' : ''}`} onChange={handleImageUpload} />
                    {errors.imageUrl && <div className="invalid-feedback d-block">{errors.imageUrl}</div>}
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2 mt-4 text-danger">Taste Profile</h6>
                  <div className="row g-3 mb-4">
                    {['sweet', 'sour', 'tangy', 'spice'].map(taste => (
                      <div className="col-6" key={taste}>
                        <label className="form-label text-capitalize small fw-bold text-muted">{taste} (0-5)</label>
                        <div className="d-flex align-items-center">
                          <input type="range" className="form-range flex-grow-1 me-2" min="0" max="5" value={formData.tasteProfile[taste]} onChange={e => handleTasteChange(e.target.value, taste)} />
                          <span className="badge bg-danger">{formData.tasteProfile[taste]}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2 text-danger">Ideal With</h6>
                  <div className="mb-4 d-flex flex-wrap gap-3">
                    {['BREAKFAST', 'LUNCH_DINNER', 'SNACK'].map(meal => (
                      <div className="form-check form-switch col-auto" key={meal}>
                        <input className="form-check-input" type="checkbox" id={`meal-${meal}`} checked={formData.idealWith.includes(meal)} onChange={() => handleMealChange(meal)} />
                        <label className="form-check-label text-capitalize small fw-medium" htmlFor={`meal-${meal}`}>{meal.toLowerCase().replace('_', ' / ')}</label>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0 text-danger">Pricing Variants</h6>
                    <button type="button" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 border-0 fw-bold" onClick={handleAddVariant}>
                      <BiPlus /> Add Option
                    </button>
                  </div>

                  <div className="variant-list">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="row g-2 mb-3 align-items-end p-3 border-0 bg-light rounded-3 mx-0 position-relative shadow-sm transition-all hover-shadow">
                        {formData.variants.length > 1 && (
                          <button type="button" className="btn btn-link link-danger p-0 position-absolute" style={{ top: '8px', right: '12px', width: 'auto', textDecoration: 'none' }} onClick={() => handleRemoveVariant(index)}>
                            <BiTrash size={18} />
                          </button>
                        )}
                        <div className="col-6">
                          <label className="form-label small fw-bold text-muted mb-1">Weight Label</label>
                          <input type="text" className={`form-control form-control-sm border-0 ${errors[`weightLabel_${index}`] ? 'is-invalid border border-danger' : ''}`} placeholder="e.g. 250g" value={variant.weightLabel} onChange={e => handleVariantChange(index, 'weightLabel', e.target.value)} />
                          {errors[`weightLabel_${index}`] && <div className="invalid-feedback small">{errors[`weightLabel_${index}`]}</div>}
                        </div>
                        <div className="col-5">
                          <label className="form-label small fw-bold text-muted mb-1">Price (₹)</label>
                          <input type="number" className={`form-control form-control-sm border-0 ${errors[`price_${index}`] ? 'is-invalid border border-danger' : ''}`} placeholder="100" value={variant.price || ''} onChange={e => handleVariantChange(index, 'price', e.target.value)} />
                          {errors[`price_${index}`] && <div className="invalid-feedback small">{errors[`price_${index}`]}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-danger w-100 fw-bold py-3 shadow border-0 rounded-3 mt-4 fs-5" style={{ background: 'linear-gradient(90deg, #ea0000, #c90000)' }}>
                    Confirm & Publish Product
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Database Viewer */}
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-lg rounded-4 bg-white h-100">
              <div className="card-header bg-dark text-white py-3 border-0">
                <h5 className="m-0 fw-bold">Live Products Database</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {products.map(p => (
                    <div className="col-12 col-md-6" key={p.id}>
                      <div className="card shadow-sm border-0 overflow-hidden h-100 rounded-4 bg-light hover-shadow transition-all">
                        <div className="row g-0 h-100">
                          <div className="col-4 d-flex align-items-center justify-content-center p-2 bg-white">
                            <img src={p.imageUrl} className="img-fluid" style={{ maxHeight: '90px', objectFit: 'contain' }} alt={p.name} />
                          </div>
                          <div className="col-8 p-3 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="fw-bold text-dark m-0">{p.name}</h6>
                              <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-link link-danger p-0 border-0">
                                <BiTrash />
                              </button>
                            </div>
                            <p className="small text-muted mb-2 text-truncate">{p.subtitle}</p>
                            <div className="d-flex flex-wrap gap-1 mt-auto">
                              {p.variants?.map((v, i) => (
                                <span key={i} className="badge bg-white text-danger border border-danger fw-normal" style={{ fontSize: '0.6rem' }}>{v.weightLabel}: ₹{v.price}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-5">
                      <p className="text-muted">No products found in the database.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
