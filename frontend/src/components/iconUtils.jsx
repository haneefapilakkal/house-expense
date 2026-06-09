import React from 'react';
import {
  Folder, FileText, Layers, Container, Activity,
  Hammer, Grid, Brush, Zap, Droplet, Layout,
  Paintbrush, Users, MoreHorizontal, HardHat,
  Wallet, Building2, Coins
} from 'lucide-react';

export const ICON_MAP = {
  Folder:        <Folder />,
  FileText:      <FileText />,
  Layers:        <Layers />,
  Container:     <Container />,
  Activity:      <Activity />,
  HardHat:       <HardHat />,
  Hammer:        <Hammer />,
  Grid:          <Grid />,
  Brush:         <Brush />,
  Zap:           <Zap />,
  Droplet:       <Droplet />,
  Layout:        <Layout />,
  Paintbrush:    <Paintbrush />,
  Users:         <Users />,
  MoreHorizontal:<MoreHorizontal />
};

export const getIconComponent = (iconName) => ICON_MAP[iconName] || <Folder />;

export const getSourceIcon = (type) => {
  switch (type) {
    case 'Loan':       return <Building2 className="text-yellow-400" />;
    case 'Asset Sale': return <Coins className="text-amber-400" />;
    default:           return <Wallet className="text-emerald-400" />;
  }
};

