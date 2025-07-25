import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Logo from "/VBSB-Logo-1-2048x754.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-4 py-8 sm:px-6 mt-16 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 md:gap-0 text-center md:text-left">

        {/* Logo & Branding */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Task Flow Logo" className="w-14 h-auto object-contain" />
            <div>
              <h2 className="text-lg font-semibold text-white">Task Flow</h2>
              <p className="text-sm text-gray-400">by VBSB Associates</p>
            </div>
          </div>
        </div>

        {/* Useful Links */}
        <div className="flex flex-col items-center gap-2 md:gap-0 md:items-center md:justify-center md:flex-row text-sm">
          <Link to="/about" className="hover:text-white px-3 transition">About</Link>
          <Link to="/privacy-policy" className="hover:text-white px-3 transition">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-white px-3 transition">Contact</Link>
        </div>

        {/* Contact Info */}
        <div className="text-sm space-y-1 max-w-xs mx-auto md:mx-0 text-center md:text-left">
          <p><strong></strong></p>
          <p>M-12, BDA Complex, Manisha Market,<br />Bhopal, MP – 462039</p>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaPhoneAlt className="text-gray-400" size={13} /> 8884237766
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaEnvelope className="text-gray-400" size={13} />
            <a href="mailto:ho@vbsb.in" className="hover:text-white underline">ho@vbsb.in</a>
          </p>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        © 2025 <span className="text-white font-medium">Task Flow</span> by VBSB Associates. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
