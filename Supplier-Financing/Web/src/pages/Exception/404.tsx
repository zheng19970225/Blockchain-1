import React from 'react';
import Link from 'umi/link';
import Exception from '@/components/Exception';

const Exception404 = () => <Exception type={404} linkElement={Link} />;

export default Exception404;
