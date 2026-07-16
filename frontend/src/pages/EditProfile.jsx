import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Mail, Phone, FileText, Upload, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export function EditProfile({ user, onProfileUpdate }) {
  const navigate = useNavigate();

  // If user is not logged in, redirect to login page
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const [name, setName] = useState(user.name || "");
  const [institution, setInstitution] = useState(user.institution || "");
  const [department, setDepartment] = useState(user.department || "Radiology");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState(user.role || "Radiologist");
  const [bio, setBio] = useState(user.bio || "");
  const [photo, setPhoto] = useState(user.photo || "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size exceeds the maximum limit of 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result); // Base64 string
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await api.updateProfile({
        name,
        institution,
        department,
        phone,
        role,
        bio,
        photo,
      });

      if (onProfileUpdate) {
        onProfileUpdate(response.user);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0F172A] px-4 py-8 md:px-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Auditor Node Profile</h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Manage your institutional credential parameters and reporting metadata.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Profile configuration updated successfully. Changes are now live across all report nodes.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main profile layout */}
      <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left column: Photo Upload & Security notice */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
            
            {/* Avatar / Photo Box */}
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-emerald-500 transition-all flex items-center justify-center bg-slate-950/60">
                {photo ? (
                  <img src={photo} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-4xl font-black font-display">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-200">
                <Upload className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-white tracking-wide">{name || "Auditor Name"}</h3>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">{role}</span>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Upload JPG or PNG files. Maximum file size allowed is 5MB.
            </p>
          </div>

          {/* Encryption Note */}
          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 p-5 rounded-2xl flex flex-col gap-2.5 select-none">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <Shield className="h-4 w-4" />
              SECURE DEPLOYMENT
            </div>
            <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
              Profile updates are securely encrypted. Changes will be reflected across reports, history, and account settings.
            </p>
          </div>
        </div>

        {/* Right column: Form details */}
        <div className="flex-1 w-full bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            Clinical Node Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Full Clinical Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Email (Disabled / Credential) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Institutional Email (Credential)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/30 border border-white/5 rounded-xl text-sm text-slate-500 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Institution / Hospital */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Institution / Hospital
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Clinical Department
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Classification Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Clinical Classification
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition cursor-pointer appearance-none"
                >
                  <option value="Radiologist">Clinical Radiologist</option>
                  <option value="Researcher">Medical Researcher</option>
                  <option value="Auditor">Quality Control Auditor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Professional Biography
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Include medical history, publications, or clinical focus..."
                rows={4}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
              />
            </div>
          </div>

          <div className="h-px bg-white/5 my-2" />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              {loading && <Upload className="h-3.5 w-3.5 animate-spin" />}
              Save Configuration
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
