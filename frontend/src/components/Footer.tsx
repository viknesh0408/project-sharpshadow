import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, AtSign, Mail, Zap } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Browse All', href: '/products' },
    { label: 'UI Kits', href: '/products?category=ui-kits' },
    { label: 'Mockups', href: '/products?category=mockups' },
    { label: 'Flyers', href: '/products?category=flyers' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
    { label: 'License', href: '#' },
  ],
};

const socials = [
  { icon: <Globe className="w-4 h-4" />, href: '#', label: 'Website' },
  { icon: <AtSign className="w-4 h-4" />, href: '#', label: 'Social' },
  { icon: <ExternalLink className="w-4 h-4" />, href: '#', label: 'GitHub' },
  { icon: <Mail className="w-4 h-4" />, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-bg mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-white text-xl">
                Sharp<span className="glow-text">Shadow</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Premium PSD files and digital assets for designers. 
              One-time purchase. Instant download. Lifetime access.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/30 hover:bg-dark-hover transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SharpShadow. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="w-3 h-3 text-brand-400" />
            Designed and Developed by YuvinaTech
          </div>
        </div>
      </div>
    </footer>
  );
}
