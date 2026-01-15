import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-100/50 text-base-content p-6 mt-12 border-t border-base-content/5">
      <aside>
        <div className="flex gap-4 mb-2 opacity-50 hover:opacity-100 transition-opacity">
           <a className="cursor-pointer hover:text-primary"><FaFacebook size={18} /></a>
           <a className="cursor-pointer hover:text-primary"><FaInstagram size={18} /></a>
           <a className="cursor-pointer hover:text-primary"><FaLinkedin size={18} /></a>
        </div>
        
        <p className="font-bold text-lg opacity-80">
          CONTROL ROOM <span className="text-primary text-xs align-top">v2</span>
        </p>
        <p className="text-xs opacity-60 italic">
          &quot;Managing your financial chaos, one taka at a time.&quot;
        </p>
        <p className="text-[10px] opacity-40 mt-2">
          © {new Date().getFullYear()} - Built by accidental accountants.
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
