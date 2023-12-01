#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float ysize        = float(lut_tex_size.y);
    highp float xsize        = float(lut_tex_size.x);
    highp float num          = xsize / ysize;
    highp vec4  color        = subpassLoad(in_color).rgba;
    // Suppose num = 15
    highp float index  = color.b * (num - 1.0); // 0-15
    highp float indexL = floor(index);          // 0-14
    highp float indexR = ceil(index);           // 1-15

    highp float pixelIndexL = (indexL + color.r) * ysize;
    highp float pixelIndexR = (indexR + color.r) * ysize;
    highp float lutXL1      = floor(pixelIndexL) / xsize;
    highp float lutXL2      = ceil(pixelIndexL) / xsize;
    highp float lutXR1      = floor(pixelIndexR) / xsize;
    highp float lutXR2      = ceil(pixelIndexR) / xsize;

    highp float pixelY = color.g * ysize;

    highp vec2 uvL1 = vec2(lutXL1, floor(pixelY) / ysize);
    highp vec2 uvL2 = vec2(lutXL1, ceil(pixelY) / ysize);
    highp vec2 uvL3 = vec2(lutXL2, floor(pixelY) / ysize);
    highp vec2 uvL4 = vec2(lutXL2, ceil(pixelY) / ysize);

    highp vec2 uvR1 = vec2(lutXR1, floor(pixelY) / ysize);
    highp vec2 uvR2 = vec2(lutXR1, ceil(pixelY) / ysize);
    highp vec2 uvR3 = vec2(lutXR2, floor(pixelY) / ysize);
    highp vec2 uvR4 = vec2(lutXR2, ceil(pixelY) / ysize);

    highp vec4  colorL1 = texture(color_grading_lut_texture_sampler, uvL1);
    highp vec4  colorL2 = texture(color_grading_lut_texture_sampler, uvL2);
    highp vec4  colorL3 = texture(color_grading_lut_texture_sampler, uvL3);
    highp vec4  colorL4 = texture(color_grading_lut_texture_sampler, uvL4);
    highp float weightY = fract(pixelY);
    highp float weightX = fract(color.r * ysize);
    highp vec4  colorL  = mix(mix(colorL1, colorL2, weightY), mix(colorL3, colorL4, weightY), weightX);

    highp vec4 colorR1 = texture(color_grading_lut_texture_sampler, uvR1);
    highp vec4 colorR2 = texture(color_grading_lut_texture_sampler, uvR2);
    highp vec4 colorR3 = texture(color_grading_lut_texture_sampler, uvR3);
    highp vec4 colorR4 = texture(color_grading_lut_texture_sampler, uvR4);
    highp vec4 colorR  = mix(mix(colorR1, colorR2, weightY), mix(colorR3, colorR4, weightY), weightX);

    highp float weight = fract(color.b * ysize);

    out_color = mix(colorL, colorR, weight); 
    /*
    highp vec4  color   = subpassLoad(in_color).rgba;
    highp float _COLORS = float(lut_tex_size.y);

    highp float b = color.b * _COLORS;
    highp float b_floor = floor(b);
    highp float b_ceil  = ceil(b);
    highp vec4  color_floor = texture(color_grading_lut_texture_sampler, vec2((b_floor + color.r) / _COLORS, color.g));
    highp vec4  color_ceil = texture(color_grading_lut_texture_sampler, vec2((b_floor + color.r) / _COLORS, color.g));
    out_color               = mix(color_floor, color_ceil, b - b_floor);*/

}
