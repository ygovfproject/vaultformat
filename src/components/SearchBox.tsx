'use client';

import { useId, useRef } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { dmf, visuallyHidden } from '@/theme';

/** Search field with a real (hidden) label, the phone keyboard's search key, and a × to clear it. */
export default function SearchBox({
  value,
  onChange,
  label,
  placeholder = label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: 2,
        pr: 0.5,
        py: 0.25,
        flex: '1 1 260px',
        maxWidth: 420,
        border: '1px solid rgba(232,238,247,0.25)',
        bgcolor: 'rgba(6,14,28,0.6)',
        '&:focus-within': { borderColor: dmf.orange },
      }}
    >
      <Box component="label" htmlFor={id} sx={visuallyHidden}>
        {label}
      </Box>
      <SearchIcon aria-hidden sx={{ color: dmf.textMuted }} />
      <InputBase
        inputRef={input}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault();
            onChange('');
          }
        }}
        placeholder={placeholder}
        inputProps={{ enterKeyHint: 'search', autoComplete: 'off', spellCheck: false }}
        sx={{
          flex: 1,
          color: dmf.text,
          py: 0.75,
          // The browser's own clear button: ours replaces it
          '& input::-webkit-search-cancel-button': { display: 'none' },
        }}
      />
      <IconButton
        aria-label="Clear search"
        onClick={() => {
          onChange('');
          input.current?.focus();
        }}
        sx={{ visibility: value ? 'visible' : 'hidden', color: dmf.textMuted, '&:hover': { color: dmf.orange, bgcolor: 'transparent' } }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
