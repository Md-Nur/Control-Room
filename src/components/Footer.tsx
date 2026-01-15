import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import NavLinks from "./Nav/NavLinks";

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-200/50 text-base-content p-10 mt-auto border-t border-base-content/5">
      <nav className="flex flex-wrap justify-center gap-6">
        <NavLinks />
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-6">
          <a className="hover:text-primary transition-colors cursor-pointer">
            <FaFacebook className="w-6 h-6" />
          </a>
          <a className="hover:text-primary transition-colors cursor-pointer">
            <FaInstagram className="w-6 h-6" />
          </a>
          <a className="hover:text-primary transition-colors cursor-pointer">
            <FaLinkedin className="w-6 h-6" />
          </a>
        </div>
      </nav>
      <aside>
        <p className="opacity-60 text-sm">
          Copyright © {new Date().getFullYear()} - Control Room
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
