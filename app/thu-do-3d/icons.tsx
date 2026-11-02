import type { SVGProps } from 'react';
type Props=Omit<SVGProps<SVGSVGElement>,'name'>&{size?:number};
const paths={
 ArrowRight:'M5 12h14 M12 5l7 7-7 7',
 Box:'M12 3l9 5v8l-9 5-9-5V8l9-5 M3 8l9 5 9-5 M12 13v8',
 Check:'M5 12l4 4L19 6',
 Download:'M12 3v12 M6 9l6 6 6-6 M4 16v5h16v-5',
 LoaderCircle:'M21 12a9 9 0 1 1-6.2-8.6',
 Rotate3D:'M21 12a9 9 0 1 1-3-6.7 M21 3v6h-6 M9 8v8 M15 8v8',
};
function Icon({name,size=20,...props}:Props&{name:keyof typeof paths}){return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d={paths[name]}/></svg>;}
export const ArrowRight=(p:Props)=><Icon name="ArrowRight" {...p}/>;
export const Box=(p:Props)=><Icon name="Box" {...p}/>;
export const Check=(p:Props)=><Icon name="Check" {...p}/>;
export const Download=(p:Props)=><Icon name="Download" {...p}/>;
export const LoaderCircle=(p:Props)=><Icon name="LoaderCircle" {...p}/>;
export const Rotate3D=(p:Props)=><Icon name="Rotate3D" {...p}/>;
