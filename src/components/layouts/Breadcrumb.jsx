import { Link, useLocation } from 'react-router-dom';

const formatSegment = (segment) => {
    return segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const Breadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbs = [
        { label: 'Trang Chủ', href: '/' },
        ...pathnames.map((segment, index) => {
            const href = '/' + pathnames.slice(0, index + 1).join('/');
            return {
                label: formatSegment(segment),
                href,
            };
        }),
    ];

    const pageTitle = breadcrumbs[breadcrumbs.length - 1].label;

    return (
        <section className="relative bg-blue-900 text-white">
            <img
                alt="Hero Section"
                aria-hidden="true"
                className="w-full h-[300px] object-cover object-center opacity-30"
                src="https://storage.googleapis.com/a1aa/image/c37d7abd-db0c-45f7-cc33-5fa82d5c6c84.jpg"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex flex-col justify-center py-24">
                <div className="max-w-3xl px-4 sm:px-0">
                    <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                        {pageTitle}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base font-normal">
                        {breadcrumbs.map((item, index) => (
                            <span key={item.href}>
                                {index !== 0 && <span className="mx-1">&gt;</span>}
                                <Link to={item.href} className="text-white-600 hover:underline">
                                    {item.label}
                                </Link>
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Breadcrumb;