import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import NavLinks from "./Nav/NavLinks";

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content rounded p-10">
      <nav className="grid grid-flow-col gap-4">
        <NavLinks />
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a>
            <FaFacebook className="w-7 h-7" />
          </a>
          <a>
            <FaInstagram className="w-7 h-7" />
          </a>
          <a>
            <FaLinkedin className="w-7 h-7" />
          </a>
        </div>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All right reserved by Control
          Room
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
