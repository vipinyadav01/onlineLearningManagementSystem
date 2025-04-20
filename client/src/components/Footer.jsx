import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <motion.footer 
            className="border-t border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center mb-14 sm:mb-0">
                <div className="text-center md:text-left text-slate-400 text-sm">
                    © {new Date().getFullYear()} TechBit Academy. All rights reserved.
                </div>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" className="text-slate-400 hover:text-white transition">Privacy Policy</a>
                    <a href="#" className="text-slate-400 hover:text-white transition">Terms of Service</a>
                    <a href="#" className="text-slate-400 hover:text-white transition">Contact Us</a>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
