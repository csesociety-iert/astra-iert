import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  [
    { label: "Sign in", href: "/login" },
    { label: "Create account", href: "/register" },
  ],
  [
    { label: "IERT official website", href: "https://www.iert.ac.in", external: true },
    { label: "CSE Department", href: "https://www.iert.ac.in", external: true },
  ],
];

export default function PortalFooter() {
  return (
    <footer className="portal-footer">
      <div className="portal-footer-content">
        <section className="portal-institute">
          <Image
            className="portal-iert-emblem"
            src="/iert-logo-footer.jpg"
            alt="Institute of Engineering and Rural Technology emblem"
            width={56}
            height={56}
          />
          <h2>Institute of Engineering and Rural Technology</h2>
          <p className="portal-address">
            26, Chaitham Lines, Near Prayag Railway Station,
            <br />
            Prayagraj - 211002 (U.P.), India
          </p>
          <address>
            <p>
              <span>Phone</span>
              <a href="tel:+9153226597135">+91-532-2659-7135</a>
            </p>
            <p>
              <span>CSE Society</span>
              <a href="mailto:csesociety.iert@gmail.com">csesociety.iert@gmail.com</a>
            </p>
            <p>
              <span>Web</span>
              <a href="https://www.iert.ac.in" target="_blank" rel="noreferrer">
                www.iert.ac.in
              </a>
            </p>
          </address>
        </section>

        {footerLinks.map((group, index) => (
          <nav
            key={index}
            className="portal-footer-nav"
            aria-label={index === 0 ? "Quick links" : "Explore"}
          >
            <h2>{index === 0 ? "Quick Links" : "Explore"}</h2>
            <div className="portal-footer-rule" />
            <ul>
              {group.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section className="portal-stats" aria-labelledby="portal-stats-title">
          <h2 id="portal-stats-title">Department at a Glance</h2>
          <div className="portal-footer-rule" />
          <dl>
            {[
              ["2001", "Established"],
              ["60", "Intake / Year"],
              ["10+", "Faculty"],
              ["500+", "Alumni"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt>{value}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="portal-footer-bottom">
        <div>
          <p>&copy; {new Date().getFullYear()} CSE Society, IERT Prayagraj. All Rights Reserved.</p>
          <p>
            Affiliated with <strong>AKTU, Lucknow</strong> | Approved by{" "}
            <strong>AICTE, New Delhi</strong>
          </p>
          <p>
            Designed &amp; developed by{" "}
            <a
              href="https://www.linkedin.com/in/vibhanshu-tiwari-a08777289/"
              target="_blank"
              rel="noreferrer"
            >
              VBHT08 <ArrowUpRight size={10} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
