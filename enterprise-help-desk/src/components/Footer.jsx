import { ShieldCheck } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-brand">

        <div className="brand-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <strong>HelpDesk AI</strong>

          <span>
            Intelligent Enterprise Support
          </span>
        </div>

      </div>

      <p>
        © 2026 HelpDesk AI. All rights reserved.
      </p>

    </footer>
  );
}

export default Footer;