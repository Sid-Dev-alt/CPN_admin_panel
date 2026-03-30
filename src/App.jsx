import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    tasteProfile: { sweet: 0, sour: 0, tangy: 0, spice: 0 },
    idealWith: [],
    variants: [{ weightLabel: '500g', price: 0 }]
  });
  
  // Custom error state
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/masalas');
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
        setErrors(prev => ({ ...prev, imageUrl: null })); // clear image error
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.description.trim()) newErrors.description = "Product description is required.";
    if (!formData.imageUrl) newErrors.imageUrl = "An image must be uploaded.";
    if (!formData.variants[0].weightLabel.trim()) newErrors.weight = "Default weight label is required.";
    if (formData.variants[0].price <= 0) newErrors.price = "A valid price is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await axios.post('http://localhost:8080/api/v1/masalas', formData);
      alert('Product created successfully!');
      fetchProducts();
      setFormData({
        name: '', subtitle: '', description: '', imageUrl: '',
        tasteProfile: { sweet: 0, sour: 0, tangy: 0, spice: 0 },
        idealWith: [], variants: [{ weightLabel: '500g', price: 0 }]
      });
      document.getElementById('imageUploader').value = '';
      setErrors({});
    } catch (error) {
      console.error(error);
      alert('Error saving product! Check connection.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/masalas/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to delete.');
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <nav className="navbar navbar-dark bg-dark shadow-sm px-4 mb-4">
        <span className="navbar-brand fw-bold mb-0 h1">CPN Foods Admin Panel</span>

      </nav>

      {/* Expanded fluid container for full width */}
      <div className="container-fluid px-3 px-xl-5">
        <div className="row g-4">
          
          {/* Add Form */}
          <div className="col-12 col-xl-5 mb-5 mb-xl-0">
            <div className="card shadow border-0 rounded-4">
              <div className="card-header bg-primary text-white py-3 border-0 rounded-top-4">
                <h5 className="m-0 fw-bold">Publish New Product</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} noValidate>
                  
                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Product Name <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control bg-light ${errors.name ? 'is-invalid' : ''}`} value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null});}} />
                    {errors.name && <div className="invalid-feedback fw-bold">{errors.name}</div>}
                  </div>
                  
                  {/* Subtitle */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Subtitle (Optional)</label>
                    <input type="text" className="form-control bg-light" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                  </div>
                  
                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Description <span className="text-danger">*</span></label>
                    <textarea className={`form-control bg-light ${errors.description ? 'is-invalid' : ''}`} rows="3" value={formData.description} onChange={e => {setFormData({...formData, description: e.target.value}); setErrors({...errors, description: null});}}></textarea>
                    {errors.description && <div className="invalid-feedback fw-bold">{errors.description}</div>}
                  </div>
                  
                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted">Upload Image File <span className="text-danger">*</span></label>
                    <input id="imageUploader" type="file" accept="image/*" className={`form-control bg-light ${errors.imageUrl ? 'is-invalid' : ''}`} onChange={handleImageUpload} />
                    {errors.imageUrl && <div className="invalid-feedback fw-bold">{errors.imageUrl}</div>}
                    {formData.imageUrl && <div className="mt-3"><img src={formData.imageUrl} alt="Preview" className="shadow-sm" style={{maxHeight:'120px', borderRadius:'8px', border: '1px solid #dee2e6'}}/></div>}
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2 mt-4 text-primary">Taste Profile</h6>
                  <div className="row g-3 mb-4">
                    {['sweet', 'sour', 'tangy', 'spice'].map(taste => (
                      <div className="col-6" key={taste}>
                        <label className="form-label text-capitalize small fw-bold text-muted">{taste} (0-5)</label>
                        <div className="d-flex align-items-center">
                          <input type="range" className="form-range flex-grow-1 me-2" min="0" max="5" value={formData.tasteProfile[taste]} onChange={e => handleTasteChange(e.target.value, taste)} />
                          <span className="badge bg-secondary">{formData.tasteProfile[taste]}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Ideal With (Multi-select)</h6>
                  <div className="mb-4 d-flex flex-wrap gap-3">
                    {['BREAKFAST', 'LUNCH_DINNER', 'SNACK'].map(meal => (
                      <div className="form-check form-switch" key={meal}>
                        <input className="form-check-input cursor-pointer" type="checkbox" id={`meal-${meal}`} checked={formData.idealWith.includes(meal)} onChange={() => handleMealChange(meal)} />
                        <label className="form-check-label text-capitalize small fw-medium cursor-pointer" htmlFor={`meal-${meal}`}>{meal.toLowerCase().replace('_', ' / ')}</label>
                      </div>
                    ))}
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Pricing Variant (Default)</h6>
                  <div className="row g-3 mb-5">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Weight Label <span className="text-danger">*</span></label>
                      <input type="text" className={`form-control bg-light ${errors.weight ? 'is-invalid' : ''}`} placeholder="e.g. 500g" value={formData.variants[0].weightLabel} onChange={e => {setFormData({ ...formData, variants: [{ ...formData.variants[0], weightLabel: e.target.value }] }); setErrors({...errors, weight: null});}} />
                      {errors.weight && <div className="invalid-feedback fw-bold">{errors.weight}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Price (₹) <span className="text-danger">*</span></label>
                      <input type="number" min="0" className={`form-control bg-light ${errors.price ? 'is-invalid' : ''}`} placeholder="350" value={formData.variants[0].price || ''} onChange={e => {setFormData({ ...formData, variants: [{ ...formData.variants[0], price: Number(e.target.value) }] }); setErrors({...errors, price: null});}} />
                      {errors.price && <div className="invalid-feedback fw-bold">{errors.price}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 fw-bold py-3 shadow border-0 rounded-3 fs-5" style={{ background: 'linear-gradient(90deg, #0d6efd, #0b5ed7)' }}>
                    Confirm
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Database Viewer */}
          <div className="col-12 col-xl-7 ps-xl-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0 text-dark">Products</h4>
              {/* <span className="badge bg-dark rounded-pill fs-6 px-3 py-2 shadow-sm">{products.length} Total</span> */}
            </div>
            
            <div className="row g-3">
              {products.map(p => (
                <div className="col-12 col-xxl-6" key={p.id}>
                  <div className="card shadow-sm border border-light overflow-hidden h-100 rounded-4">
                    <div className="row g-0 h-100">
                      <div className="col-4 bg-light d-flex align-items-center justify-content-center p-3 border-end">
                        <img src={p.imageUrl} className="img-fluid" style={{ maxHeight: '110px', objectFit: 'contain' }} alt={p.name} />
                      </div>
                      <div className="col-8 p-3 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold text-dark m-0">{p.name}</h6>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-sm  btn-outline-danger shadow-sm rounded-1 p-1 px-2 border-0" title="Delete Product">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                              <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                            </svg>
                          </button>
                        </div>
                        <p className="small text-muted mb-3 lh-sm" style={{flex: 1}}>{p.subtitle || 'No subtitle provided'}</p>
                        <div className="d-flex align-items-center gap-2 mt-auto">
                          <span className="badge bg-danger shadow-sm">Spice: {p.tasteProfile?.spice || 0}/5</span>
                          <span className="badge bg-success shadow-sm">₹{p.variants?.[0]?.price || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-12">
                   <div className="alert alert-info border-0 shadow-sm rounded-4 text-center py-5">
                     <h5 className="fw-bold mb-2">No Masalas in the Database</h5>
                     <p className="text-secondary m-0">Use the panel on the left to add your very first product!</p>
                   </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
